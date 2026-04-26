const User = require('../models/User');
const Hospital = require('../models/Hospital');
const ChatbotAnalytics = require('../models/ChatbotAnalytics');
const { MEDICAL_KB, findMedicalAnswer } = require('../medicalKnowledge');
const { expandQuery } = require('../utils/synonyms');
const { autocorrectQuery } = require('../utils/spellCheck');
const { NlpManager } = require('node-nlp');
const Fuse = require('fuse.js');
const axios = require('axios');
const path = require('path');

// Initialize NLP Manager
const nlpManager = new NlpManager({ languages: ['en'], forceNER: true });
try {
    nlpManager.load(path.join(__dirname, '..', 'nlp_model.nlp'));
    console.log('✅ NLP model loaded successfully');
} catch (e) {
    console.warn('⚠️ NLP Model not found. Run: node server/nlp/trainModel.js');
}

// Initialize Fuse.js with optimized config (persistent instance)
const fuse = new Fuse(MEDICAL_KB, {
    keys: [
        { name: 'keywords', weight: 0.7 },
        { name: 'category', weight: 0.2 },
        { name: 'answer', weight: 0.1 }
    ],
    includeScore: true,
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 3
});

// Emergency keywords for immediate escalation
const EMERGENCY_KEYWORDS = [
    'heart attack', 'stroke', 'cant breathe', 'not breathing', 'unconscious',
    'severe bleeding', 'choking', 'poisoning', 'overdose', 'suicide',
    'chest pain severe', 'collapsed', 'seizure now', 'anaphylaxis',
    'accident', 'dying', 'cardiac arrest', 'baby not breathing'
];

const INTENT_HIGH_THRESHOLD = 0.75;
const INTENT_MEDIUM_THRESHOLD = 0.45;
const INTENT_AMBIGUITY_GAP = 0.12;

const INFO_KEYWORDS = [
    'what is', 'what are', 'how to', 'how do', 'explain',
    'tell me about', 'symptoms of', 'cause of', 'definition',
    'treatment for', 'cure for', 'medicine for', 'diet for'
];

const RECOMMENDATION_KEYWORDS = [
    'recommend', 'recomend', 'best hospital', 'find hospital', 'hospital for',
    'hospital of', 'where should i go', 'need a hospital', 'suggest',
    'looking for hospital', 'find me', 'show me', 'hospital', 'hospitals',
    'clinic', 'clinics'
];

const MEDICAL_KEYWORDS = [
    'chest pain', 'heart', 'kidney', 'cancer', 'ortho', 'surgery', 'diabetes',
    'sugar', 'neuro', 'neurology', 'brain', 'eye', 'dental', 'teeth', 'skin',
    'derma', 'stomach', 'gastro', 'pediatric', 'child', 'baby', 'maternity',
    'gynecology', 'women', 'ent', 'ear', 'nose', 'throat', 'lung', 'asthma',
    'breathing', 'fever', 'infection'
];

const QUERY_STOPWORDS = new Set([
    'i', 'me', 'my', 'mine', 'you', 'your', 'the', 'a', 'an', 'to', 'for',
    'of', 'and', 'or', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'with',
    'please', 'help', 'need', 'have', 'has', 'had', 'do', 'does', 'did',
    'can', 'could', 'should', 'would', 'tell', 'about', 'near', 'best',
    'find', 'show', 'give', 'recommend', 'hospital', 'hospitals'
]);

/**
 * Logic to recommend hospitals based on query and patient info
 * Powered by ML (Python Microservice)
 */
async function recommendHospitals(query, patientInfo, insuranceCompany) {
    try {
        const queryLower = query.toLowerCase();
        const history = patientInfo?.medicalHistory ? patientInfo.medicalHistory.toLowerCase() : '';

        const mlPayload = {
            symptoms: `${queryLower} ${history}`.trim()
        };

        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        const response = await axios.post(`${mlUrl}/predict`, mlPayload, { timeout: 10000 });
        let results = response.data.hospitals;

        if (results && results.length > 0) {
            const validIds = results.map(h => h.hospitalId).filter(id => id);

            if (validIds.length > 0) {
                const dbHospitals = await Hospital.find({
                    _id: { $in: validIds },
                    networkStatus: 'Active'
                });

                results = results.filter(rec =>
                    dbHospitals.some(db => db._id.toString() === rec.hospitalId)
                );

                const availableCities = [...new Set(dbHospitals.map(h => h.city))];
                const mentionedCity = availableCities.find(city =>
                    queryLower.includes(city.toLowerCase())
                );

                if (mentionedCity) {
                    const cityFiltered = results.filter(rec => {
                        const dbMatch = dbHospitals.find(db => db._id.toString() === rec.hospitalId);
                        return dbMatch && dbMatch.city.toLowerCase() === mentionedCity.toLowerCase();
                    });
                    if (cityFiltered.length > 0) results = cityFiltered;
                }
            }
        }

        let insuranceFiltered = false;
        if (insuranceCompany && results.length > 0) {
            const filtered = results.filter(h => h.insuranceCompany === insuranceCompany);
            if (filtered.length > 0) {
                results = filtered;
                insuranceFiltered = true;
            }
        }

        return { type: 'hospital_recommendation', hospitals: results, insuranceFiltered, insuranceCompany };
    } catch (error) {
        console.error('ML Recommendation Error:', error.message);
        return { type: 'hospital_recommendation', hospitals: [] };
    }
}

/**
 * Check if query is an emergency
 */
function checkEmergency(queryLower) {
    return EMERGENCY_KEYWORDS.some(kw => queryLower.includes(kw));
}

function hasEmergencyNegation(queryLower) {
    const negationPatterns = [
        'not emergency',
        'no emergency',
        'not severe',
        'mild chest pain',
        'not serious',
        'no chest pain now'
    ];

    return negationPatterns.some(pattern => queryLower.includes(pattern));
}

function getTopIntentCandidates(nlpResponse) {
    if (Array.isArray(nlpResponse?.classifications) && nlpResponse.classifications.length > 0) {
        return [...nlpResponse.classifications]
            .sort((a, b) => (b.score || 0) - (a.score || 0))
            .slice(0, 2)
            .map(c => ({ intent: c.intent, score: c.score || 0 }));
    }

    if (nlpResponse?.intent) {
        return [{ intent: nlpResponse.intent, score: nlpResponse.score || 0 }];
    }

    return [];
}

function detectIntentByKeywords(queryLower) {
    const infoKeywordHit = INFO_KEYWORDS.some(k => queryLower.includes(k));
    const recKeywordHit = RECOMMENDATION_KEYWORDS.some(k => queryLower.includes(k));
    const medicalKeywordHit = MEDICAL_KEYWORDS.some(k => queryLower.includes(k));

    return {
        infoConfidence: infoKeywordHit ? 0.58 : 0,
        recommendationConfidence: (recKeywordHit || (!infoKeywordHit && medicalKeywordHit)) ? 0.58 : 0
    };
}

function decideIntent(queryLower, nlpResponse) {
    const topCandidates = getTopIntentCandidates(nlpResponse);
    const top = topCandidates[0] || { intent: 'none', score: 0 };
    const second = topCandidates[1] || { intent: 'none', score: 0 };

    const nlpInfoConfidence = topCandidates.find(c => c.intent === 'medical.info')?.score || 0;
    const nlpRecommendationConfidence = topCandidates.find(c => c.intent === 'hospital.recommendation')?.score || 0;
    const keywordConfidence = detectIntentByKeywords(queryLower);

    const infoConfidence = Math.max(nlpInfoConfidence, keywordConfidence.infoConfidence);
    const recommendationConfidence = Math.max(nlpRecommendationConfidence, keywordConfidence.recommendationConfidence);

    if (top.intent === 'emergency.sos' && top.score >= INTENT_MEDIUM_THRESHOLD) {
        return { intent: 'emergency.sos', confidence: top.score, shouldClarify: false };
    }

    const confidenceGap = Math.abs(infoConfidence - recommendationConfidence);
    if (
        infoConfidence >= INTENT_MEDIUM_THRESHOLD &&
        recommendationConfidence >= INTENT_MEDIUM_THRESHOLD &&
        confidenceGap <= 0.15
    ) {
        return {
            intent: 'ambiguous',
            confidence: Math.max(infoConfidence, recommendationConfidence),
            shouldClarify: true
        };
    }

    const selectedIntent = infoConfidence >= recommendationConfidence ? 'medical.info' : 'hospital.recommendation';
    const selectedConfidence = Math.max(infoConfidence, recommendationConfidence);
    const secondaryConfidence = Math.min(infoConfidence, recommendationConfidence);

    const nlpAmbiguous =
        second.intent !== 'none' &&
        ['medical.info', 'hospital.recommendation'].includes(top.intent) &&
        ['medical.info', 'hospital.recommendation'].includes(second.intent) &&
        Math.abs((top.score || 0) - (second.score || 0)) <= INTENT_AMBIGUITY_GAP;

    if (selectedConfidence < INTENT_MEDIUM_THRESHOLD) {
        return { intent: 'unknown', confidence: selectedConfidence, shouldClarify: false };
    }

    if (selectedConfidence < INTENT_HIGH_THRESHOLD && (nlpAmbiguous || secondaryConfidence >= INTENT_MEDIUM_THRESHOLD)) {
        return { intent: selectedIntent, confidence: selectedConfidence, shouldClarify: true };
    }

    return { intent: selectedIntent, confidence: selectedConfidence, shouldClarify: false };
}

function extractTopicFromQuery(query) {
    const tokens = query
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(token => token.length > 3 && !QUERY_STOPWORDS.has(token));

    if (tokens.length === 0) return 'this condition';
    return tokens.slice(0, 3).join(' ');
}

function buildClarificationResponse(query) {
    const topic = extractTopicFromQuery(query);
    return {
        type: 'medical_info',
        answer: `I can help with this in two ways. Do you want medical information about **${topic}**, or should I recommend nearby hospitals for it?`,
        category: 'Need Clarification',
        severity: 'info',
        confidence: 50,
        matchSource: 'clarify',
        followUpQuestions: [
            `Explain symptoms and treatment for ${topic}`,
            `Recommend hospitals for ${topic}`
        ]
    };
}

function buildRewriteSuggestions(query) {
    const topic = extractTopicFromQuery(query);
    return [
        `What are the symptoms of ${topic}?`,
        `How is ${topic} treated?`,
        `Recommend hospitals for ${topic} near me.`
    ];
}

/**
 * Build the response object with follow-up questions and confidence
 */
function buildMedicalResponse(match, confidence, matchSource) {
    const response = {
        type: 'medical_info',
        answer: match.answer,
        category: match.category,
        severity: match.severity,
        confidence: Math.round(confidence * 100),
        matchSource
    };

    if (match.followUpQuestions && match.followUpQuestions.length > 0) {
        response.followUpQuestions = match.followUpQuestions;
    }

    // Add severity-specific warnings
    if (match.severity === 'danger') {
        response.answer = '🚨 **This is a serious condition. Please seek immediate medical attention if you are experiencing symptoms.**\n\n' + match.answer;
    }

    return response;
}

/**
 * Controller: Handle chatbot queries
 */
exports.ask = async (req, res) => {
    const startTime = Date.now();
    const { query, insuranceCompany, patientInfo } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    try {
        // Step 1: Spell-check the query
        const spellResult = autocorrectQuery(query, { context: 'medical' });
        const correctedQuery = spellResult.corrected;

        // Step 2: Expand with synonyms
        const expandedQuery = expandQuery(correctedQuery);
        const queryLower = expandedQuery.toLowerCase();

        // Step 3: Check for emergency
        if (checkEmergency(queryLower) && !hasEmergencyNegation(queryLower)) {
            const analyticsEntry = {
                query, correctedQuery, expandedQuery,
                intent: 'emergency.sos', intentConfidence: 1.0,
                matchSource: 'keyword', responseTime: Date.now() - startTime,
                userId: req.user?._id
            };
            ChatbotAnalytics.create(analyticsEntry).catch(() => {});

            return res.json({
                type: 'emergency',
                answer: '🚨 **EMERGENCY DETECTED!**\n\n**Call 112 immediately** (India Emergency Number).\n\n**While waiting:**\n- If cardiac arrest: Start CPR (30 chest compressions + 2 breaths)\n- If choking: Heimlich maneuver (5 back blows + 5 abdominal thrusts)\n- If bleeding: Apply direct pressure with clean cloth\n- If seizure: Clear area, turn person on side, do NOT restrain\n\n🚑 Use our **ambulance tracking** feature for fastest response.\n\n**Helplines:**\n- Emergency: 112\n- Ambulance: 108\n- Mental Health (iCall): 9152987821',
                severity: 'danger',
                confidence: 100
            });
        }

        // Step 4: NLP intent detection
        const nlpResponse = await nlpManager.process('en', correctedQuery);
        const intent = nlpResponse.intent;
        const nlpScore = nlpResponse.score || 0;
        const intentDecision = decideIntent(queryLower, nlpResponse);

        if (intentDecision.intent === 'emergency.sos') {
            // NLP also detected emergency
            return res.json({
                type: 'emergency',
                answer: nlpResponse.answer || '🚨 Please call 112 immediately for emergency assistance!',
                severity: 'danger',
                confidence: Math.round((intentDecision.confidence || nlpScore) * 100)
            });
        }

        if (intentDecision.shouldClarify) {
            ChatbotAnalytics.create({
                query, correctedQuery, expandedQuery,
                intent: intentDecision.intent,
                intentConfidence: intentDecision.confidence,
                matchSource: 'clarify',
                responseTime: Date.now() - startTime,
                userId: req.user?._id
            }).catch(() => {});

            return res.json(buildClarificationResponse(query));
        }

        // Step 6: Hospital recommendation
        if (intentDecision.intent === 'hospital.recommendation') {
            const recsResponse = await recommendHospitals(query, patientInfo, insuranceCompany);

            const analyticsEntry = {
                query, correctedQuery, expandedQuery,
                intent: 'hospital.recommendation', intentConfidence: intentDecision.confidence || nlpScore,
                matchSource: 'nlp', responseTime: Date.now() - startTime,
                userId: req.user?._id
            };
            ChatbotAnalytics.create(analyticsEntry).catch(() => {});

            if (recsResponse.hospitals && recsResponse.hospitals.length > 0) {
                return res.json(recsResponse);
            }
            return res.json({
                type: 'hospital_recommendation',
                answer: "🤖 *I tried to find matching hospitals through our ML engine, but couldn't find exact matches or the ML service might be starting up (cold start). Please try again in 30 seconds.*",
                hospitals: []
            });
        }

        // Step 7: Medical KB search with multiple strategies

        // Strategy A: Direct keyword match (fastest, highest confidence)
        const directMatch = findMedicalAnswer(expandedQuery);
        if (directMatch) {
            const response = buildMedicalResponse(directMatch, 0.95, 'keyword');

            if (spellResult.wasCorrected) {
                response.correctedQuery = spellResult.corrected;
                response.answer = `*(Showing results for "${spellResult.corrected}")*\n\n` + response.answer;
            }

            const analyticsDoc = await ChatbotAnalytics.create({
                query, correctedQuery, expandedQuery,
                intent: 'medical.info', intentConfidence: 0.95,
                matchedCategory: directMatch.category,
                matchSource: 'keyword', responseTime: Date.now() - startTime,
                userId: req.user?._id
            }).catch(() => null);

            if (analyticsDoc) response.queryId = analyticsDoc._id;

            return res.json(response);
        }

        // Strategy B: Fuse.js fuzzy search (handles typos and variations)
        const searchResults = fuse.search(queryLower);

        if (searchResults.length > 0 && searchResults[0].score < 0.5) {
            const bestMatch = searchResults[0].item;
            const confidence = 1 - searchResults[0].score; // Fuse score is 0=perfect, 1=worst
            const response = buildMedicalResponse(bestMatch, confidence, 'fuse');

            if (spellResult.wasCorrected) {
                response.correctedQuery = spellResult.corrected;
                response.answer = `*(Showing results for "${spellResult.corrected}")*\n\n` + response.answer;
            }

            // If there are multiple close matches, suggest related topics
            if (searchResults.length > 1 && searchResults[1].score < 0.6) {
                const relatedTopics = searchResults.slice(1, 4)
                    .map(r => r.item.category)
                    .filter((c, i, arr) => c !== bestMatch.category && arr.indexOf(c) === i);
                if (relatedTopics.length > 0) {
                    response.relatedTopics = relatedTopics;
                }
            }

            const analyticsDoc = await ChatbotAnalytics.create({
                query, correctedQuery, expandedQuery,
                intent: 'medical.info', intentConfidence: confidence,
                matchedCategory: bestMatch.category,
                matchSource: 'fuse', responseTime: Date.now() - startTime,
                userId: req.user?._id
            }).catch(() => null);

            if (analyticsDoc) response.queryId = analyticsDoc._id;

            return res.json(response);
        }

        // Step 8: Fallback — no match found
        ChatbotAnalytics.create({
            query, correctedQuery, expandedQuery,
            intent: intent || 'unknown', intentConfidence: intentDecision.confidence || nlpScore || 0,
            matchSource: 'fallback', responseTime: Date.now() - startTime,
            userId: req.user?._id
        }).catch(() => {});

        // Provide helpful suggestions based on available categories
        const categories = [...new Set(MEDICAL_KB.map(e => e.category))];
        const sampleCategories = categories.slice(0, 8).join(', ');
        const rewriteSuggestions = buildRewriteSuggestions(query);

        return res.json({
            type: 'medical_info',
            answer: `🤖 I could not confidently understand this query yet.\n\n**Here's what I can help with:**\n${sampleCategories}\n\n**Try one of these rewrites:**\n- ${rewriteSuggestions[0]}\n- ${rewriteSuggestions[1]}\n- ${rewriteSuggestions[2]}\n\n💡 *You can also ask me to recommend hospitals for your condition.*`,
            category: 'General Info',
            severity: 'info',
            confidence: 0,
            matchSource: 'fallback',
            followUpQuestions: rewriteSuggestions
        });

    } catch (err) {
        console.error('Chatbot Controller Error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Controller: Submit feedback for a chatbot response
 */
exports.submitFeedback = async (req, res) => {
    const { queryId, feedback, comment } = req.body;
    if (!queryId || !feedback) {
        return res.status(400).json({ message: 'queryId and feedback are required' });
    }
    if (!['helpful', 'not_helpful'].includes(feedback)) {
        return res.status(400).json({ message: 'feedback must be "helpful" or "not_helpful"' });
    }

    try {
        const updated = await ChatbotAnalytics.findByIdAndUpdate(
            queryId,
            { feedback, feedbackComment: comment || '' },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Query record not found' });
        }

        res.json({ message: 'Feedback recorded. Thank you!', updated: true });
    } catch (err) {
        console.error('Feedback Error:', err);
        res.status(500).json({ message: 'Failed to record feedback' });
    }
};

async function computeClarificationStats(startDate) {
    const docs = await ChatbotAnalytics.find({
        createdAt: { $gte: startDate },
        userId: { $exists: true, $ne: null }
    })
        .select('userId createdAt matchSource')
        .sort({ userId: 1, createdAt: 1 })
        .lean();

    const byUser = new Map();
    for (const doc of docs) {
        const userKey = doc.userId.toString();
        if (!byUser.has(userKey)) byUser.set(userKey, []);
        byUser.get(userKey).push(doc);
    }

    let clarificationCount = 0;
    let clarificationRecoveredCount = 0;
    const recoveryWindowMs = 30 * 60 * 1000;

    for (const events of byUser.values()) {
        for (let i = 0; i < events.length; i++) {
            if (events[i].matchSource !== 'clarify') continue;

            clarificationCount += 1;
            const clarifyTime = new Date(events[i].createdAt).getTime();

            for (let j = i + 1; j < events.length; j++) {
                const eventTime = new Date(events[j].createdAt).getTime();
                if ((eventTime - clarifyTime) > recoveryWindowMs) break;

                const source = events[j].matchSource;
                if (source === 'clarify') continue;
                if (source === 'keyword' || source === 'fuse' || source === 'nlp') {
                    clarificationRecoveredCount += 1;
                }
                break;
            }
        }
    }

    const clarificationRate = docs.length > 0
        ? Math.round((clarificationCount / docs.length) * 100)
        : 0;
    const clarificationRecoveryRate = clarificationCount > 0
        ? Math.round((clarificationRecoveredCount / clarificationCount) * 100)
        : 0;

    return {
        totalTrackedQueries: docs.length,
        clarificationCount,
        clarificationRecoveredCount,
        clarificationRate,
        clarificationRecoveryRate,
        recoveryWindowMinutes: 30
    };
}

/**
 * Controller: Get chatbot analytics summary
 */
exports.getAnalytics = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [totalQueries, matchSources, feedbackStats, avgResponseTime, topCategories, weeklyClarificationStats] = await Promise.all([
            ChatbotAnalytics.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),

            ChatbotAnalytics.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                { $group: { _id: '$matchSource', count: { $sum: 1 } } }
            ]),

            ChatbotAnalytics.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo }, feedback: { $exists: true } } },
                { $group: { _id: '$feedback', count: { $sum: 1 } } }
            ]),

            ChatbotAnalytics.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo }, responseTime: { $exists: true } } },
                { $group: { _id: null, avg: { $avg: '$responseTime' } } }
            ]),

            ChatbotAnalytics.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo }, matchedCategory: { $exists: true } } },
                { $group: { _id: '$matchedCategory', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            computeClarificationStats(sevenDaysAgo)
        ]);

        const fallbackCount = matchSources.find(s => s._id === 'fallback')?.count || 0;
        const successRate = totalQueries > 0
            ? Math.round(((totalQueries - fallbackCount) / totalQueries) * 100)
            : 0;

        res.json({
            period: '30 days',
            totalQueries,
            successRate: `${successRate}%`,
            matchSources: matchSources.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
            feedbackStats: feedbackStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
            avgResponseTime: avgResponseTime[0]?.avg ? `${Math.round(avgResponseTime[0].avg)}ms` : 'N/A',
            topCategories: topCategories.map(c => ({ category: c._id, count: c.count })),
            weekly: {
                period: '7 days',
                clarificationRate: `${weeklyClarificationStats.clarificationRate}%`,
                clarificationRecoveryRate: `${weeklyClarificationStats.clarificationRecoveryRate}%`,
                clarificationCount: weeklyClarificationStats.clarificationCount,
                clarificationRecoveredCount: weeklyClarificationStats.clarificationRecoveredCount,
                totalTrackedQueries: weeklyClarificationStats.totalTrackedQueries,
                recoveryWindowMinutes: weeklyClarificationStats.recoveryWindowMinutes
            }
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({ message: 'Failed to fetch analytics' });
    }
};

/**
 * Controller: Generate personalized health summary (Rule-based)
 */
exports.getHealthSummary = async (req, res) => {
    const { patientInfo } = req.body;
    if (!patientInfo) return res.status(400).json({ message: 'Patient info is required' });

    try {
        const history = (patientInfo.medicalHistory || '').toLowerCase();
        const categories = [];
        const topTips = [];

        if (history.includes('diabetes')) {
            categories.push('Endocrinology');
            topTips.push('Monitor your blood sugar levels daily and maintain a low-glycemic diet.');
        }
        if (history.includes('heart') || history.includes('bp') || history.includes('hypertension')) {
            categories.push('Cardiovascular');
            topTips.push('Reduce salt intake and maintain a regular 30-minute cardio routine.');
        }
        if (history.includes('kidney')) {
            categories.push('Nephrology');
            topTips.push('Ensure adequate hydration and avoid self-medicating with NSAIDs like ibuprofen.');
        }
        if (history.includes('asthma') || history.includes('breathing')) {
            categories.push('Respiratory');
            topTips.push('Keep your rescue inhaler accessible and avoid known dust/pollen triggers.');
        }
        if (history.includes('thyroid')) {
            categories.push('Endocrinology');
            topTips.push('Take thyroid medication on an empty stomach, 30 minutes before breakfast.');
        }
        if (history.includes('arthritis') || history.includes('joint')) {
            categories.push('Orthopedics');
            topTips.push('Low-impact exercises like swimming and yoga can significantly reduce joint pain.');
        }
        if (history.includes('anemia') || history.includes('iron')) {
            categories.push('Hematology');
            topTips.push('Include iron-rich foods (spinach, jaggery, lentils) and take iron tablets with vitamin C for better absorption.');
        }

        if (topTips.length === 0) {
            categories.push('General Health');
            topTips.push('Stay hydrated and maintain a balanced diet with adequate protein.');
            topTips.push('Aim for 7-9 hours of quality sleep for optimal recovery.');
            topTips.push('Schedule regular preventive checkups with your primary physician.');
        }

        res.json({
            hasSummary: true,
            categories: categories.length > 0 ? categories : ['General'],
            topTips: topTips.slice(0, 4)
        });
    } catch (err) {
        console.error('Health Summary Error:', err);
        res.status(500).json({ hasSummary: false });
    }
};
