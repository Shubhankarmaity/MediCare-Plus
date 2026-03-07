const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { MEDICAL_KB } = require('../medicalKnowledge');
const { NlpManager } = require('node-nlp');

const axios = require('axios');

// Initialize NLP Manager
const nlpManager = new NlpManager({ languages: ['en'], forceNER: true });
// Try to load the trained model; if it fails, it will just use fallback logic
try {
    nlpManager.load('nlp_model.nlp');
} catch (e) {
    console.error("NLP Model not found. Did you run the training script?");
}

/**
 * Logic to recommend hospitals based on query and patient info
 * NOW POWERED BY ML (Python Microservice)
 */
async function recommendHospitals(query, patientInfo, insuranceCompany) {
    try {
        const queryLower = query.toLowerCase();
        const history = patientInfo?.medicalHistory ? patientInfo.medicalHistory.toLowerCase() : "";

        // Form the data to send to the ML model
        const mlPayload = {
            symptoms: `${queryLower} ${history}`.trim()
        };

        // Call the Python ML Microservice
        console.log(`Sending data to ML Model: "${mlPayload.symptoms}"`);
        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
        const response = await axios.post(`${mlUrl}/predict`, mlPayload);
        let results = response.data.hospitals;

        // Validate the genuine database IDs for these hospitals from our MongoDB
        if (results && results.length > 0) {
            // Get valid IDs (ignoring any legacy Kaggle CSV ones without an ID)
            const validIds = results.map(h => h.hospitalId).filter(id => id);

            if (validIds.length > 0) {
                const dbHospitals = await Hospital.find({
                    _id: { $in: validIds },
                    networkStatus: 'Active'
                });

                // Filter out any ML results that point to a soft-deleted or inactive hospital
                results = results.filter(rec =>
                    dbHospitals.some(db => db._id.toString() === rec.hospitalId)
                );

                // --- NEW: City / Location Filtering ---
                // Extract unique cities from our active hospitals
                const availableCities = [...new Set(dbHospitals.map(h => h.city))];

                // Check if the user query mentioned any of these cities
                const mentionedCity = availableCities.find(city =>
                    queryLower.includes(city.toLowerCase())
                );

                if (mentionedCity) {
                    // Filter the results to only include hospitals in the mentioned city
                    const cityFilteredResults = results.filter(rec => {
                        const dbMatch = dbHospitals.find(db => db._id.toString() === rec.hospitalId);
                        return dbMatch && dbMatch.city.toLowerCase() === mentionedCity.toLowerCase();
                    });

                    // Only apply the filter if we actually have hospitals in that city for this condition
                    // Otherwise, we gracefully fall back to showing the best matches anywhere
                    if (cityFilteredResults.length > 0) {
                        results = cityFilteredResults;
                    }
                }
            }
        }

        // Filter for insurance if requested by the user
        let insuranceFiltered = false;
        if (insuranceCompany && results.length > 0) {
            const filtered = results.filter(h => h.insuranceCompany === insuranceCompany);
            if (filtered.length > 0) {
                results = filtered;
                insuranceFiltered = true;
            }
        }

        return {
            type: 'hospital_recommendation',
            hospitals: results,
            insuranceFiltered,
            insuranceCompany
        };

    } catch (error) {
        console.error('ML Recommendation Error:', error.message);
        // Fallback to empty list if ML server is down
        return { type: 'hospital_recommendation', hospitals: [] };
    }
}

/**
 * Controller: Handle chatbot queries
 */
exports.ask = async (req, res) => {
    const { query, insuranceCompany, patientInfo } = req.body;
    if (!query) return res.status(400).json({ message: 'Query is required' });

    try {
        const queryLower = query.toLowerCase();

        // Use NLP to detect intent
        const nlpResponse = await nlpManager.process('en', queryLower);
        const intent = nlpResponse.intent;
        const nlpScore = nlpResponse.score;

        // 1. Check for Information Intents
        let isInfoQuery = false;
        if (intent === 'medical.info' && nlpScore > 0.5) {
            isInfoQuery = true;
        } else {
            const infoKeywords = [
                'what is', 'what are', 'how to', 'how do', 'explain', 'tell me about', 'symptoms of', 'cause of', 'definition'
            ];
            isInfoQuery = infoKeywords.some(k => queryLower.includes(k));
        }

        // 2. Check for Hospital Recommendation Intent
        let isRecommendation = false;
        if (intent === 'hospital.recommendation' && nlpScore > 0.5) {
            isRecommendation = true;
        } else {
            const recKeywords = [
                'recommend', 'recomend', 'best hospital', 'find hospital', 'hospital for',
                'hospital of', 'where should i go', 'need a hospital', 'suggest', 'looking for hospital',
                'prefer', 'find me', 'show me', 'hospital', 'hospitals', 'clinic', 'clinics'
            ];
            const medicalKeywords = [
                'chest pain', 'heart', 'kidney', 'cancer', 'ortho', 'surgery', 'diabetes', 'sugar',
                'neuro', 'neurology', 'brain', 'eye', 'dental', 'teeth', 'skin', 'derma', 'stomach',
                'gastro', 'pediatric', 'child', 'baby', 'maternity', 'gynecology', 'women', 'ent',
                'ear', 'nose', 'throat', 'lung', 'asthma', 'breathing', 'fever', 'infection'
            ];
            isRecommendation = recKeywords.some(k => queryLower.includes(k)) ||
                (medicalKeywords.some(k => queryLower.includes(k)) && !isInfoQuery);
        }

        let recsResponse = null;
        if (isRecommendation) {
            recsResponse = await recommendHospitals(query, patientInfo, insuranceCompany);
        }

        if (recsResponse) {
            if (recsResponse.hospitals && recsResponse.hospitals.length > 0) {
                return res.json(recsResponse);
            } else {
                // It was a recommendation intent, but ML returned nothing (or ML service failed)
                let noResultMsg = "🤖 *I tried to run your symptoms through our ML engine to find matching hospitals, but I couldn't find any exact matches or the ML service might be waking up (Render cold start). Please try again in 30 seconds.*";
                return res.json({
                    type: 'hospital_recommendation',
                    answer: noResultMsg, // Fallback message explicitly acknowledging the hospital search
                    hospitals: []
                });
            }
        }

        // 2. If it's not a recommendation intent, check the static Medical KB using Fuse.js
        const Fuse = require('fuse.js');
        const fuse = new Fuse(MEDICAL_KB, {
            keys: ['keywords'],
            includeScore: true,
            threshold: 0.4, // Lower threshold = more strict. 0.4 allows for typos like "daibetes"
            ignoreLocation: true // Match keyword anywhere in the query
        });

        const searchResults = fuse.search(queryLower);
        let bestMatch = searchResults.length > 0 ? searchResults[0].item : null;

        if (bestMatch) {
            return res.json({
                type: 'medical_info',
                answer: bestMatch.answer,
                category: bestMatch.category,
                severity: bestMatch.severity
            });
        }

        // 3. Fallback if no match found
        return res.json({
            type: 'medical_info',
            answer: "🤖 I'm sorry, I don't have information on that specific medical topic in my database. Please consult a doctor for accurate medical advice.",
            category: 'General Info',
            severity: 'info'
        });

    } catch (err) {
        console.error('Chatbot Controller Error:', err);
        res.status(500).json({ message: 'Internal server error' });
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

        // Generic tips if none detected
        if (topTips.length === 0) {
            categories.push('General Health');
            topTips.push('Stay hydrated and maintain a balanced diet with adequate protein.');
            topTips.push('Aim for 7-9 hours of quality sleep for optimal recovery.');
            topTips.push('Schedule regular preventive checkups with your primary physician.');
        }

        res.json({
            hasSummary: true,
            categories: categories.length > 0 ? categories : ['General'],
            topTips: topTips.slice(0, 3)
        });
    } catch (err) {
        console.error('Health Summary Error:', err);
        res.status(500).json({ hasSummary: false });
    }
};
