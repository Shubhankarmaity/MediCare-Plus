const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { MEDICAL_KB } = require('../medicalKnowledge');

/**
 * Logic to recommend hospitals based on query and patient info
 */
async function recommendHospitals(query, patientInfo, insuranceCompany) {
    try {
        const hospitals = await Hospital.find({ networkStatus: 'Active' });
        const queryLower = query.toLowerCase();

        // Basic condition detection from query
        const conditions = [
            'cardiology', 'orthopedics', 'oncology', 'neurology', 'emergency',
            'kidney', 'maternity', 'surgery', 'pediatrics', 'dermatology'
        ];
        const detectedConditions = conditions.filter(c => queryLower.includes(c));

        if (patientInfo && patientInfo.medicalHistory) {
            conditions.forEach(c => {
                if (patientInfo.medicalHistory.toLowerCase().includes(c) && !detectedConditions.includes(c)) {
                    detectedConditions.push(c);
                }
            });
        }

        const scoredHospitals = hospitals.map(h => {
            let score = 0;
            let reasons = [];

            // 1. Specialty Match (35 pts)
            if (detectedConditions.some(c => h.specialties.toLowerCase().includes(c))) {
                score += 35;
                reasons.push(`Specializes in ${detectedConditions.join(', ')}`);
            }

            // 2. ICU (20 pts)
            if (h.hasICU) {
                score += 20;
                reasons.push('ICU facility available');
            }

            // 3. Emergency (15 pts)
            if (h.hasEmergency) {
                score += 15;
                reasons.push('24/7 Emergency support');
            }

            // 4. Rating (15 pts) - scale 0-5 to 0-15
            const ratingScore = (h.rating / 5) * 15;
            score += ratingScore;
            if (h.rating >= 4) reasons.push(`Highly rated (${h.rating}⭐)`);

            // 5. NABH (10 pts)
            if (h.naabhAccredited) {
                score += 10;
                reasons.push('NABH Accredited');
            }

            // 6. Cashless (5 pts)
            if (h.cashlessAvailable) {
                score += 5;
                reasons.push('Cashless facility');
            }

            // 7. Facilities (5 pts)
            const facilityCount = [h.diagnosticLab, h.pharmacyAvailable, h.ambulanceAvailable, h.hasOT].filter(Boolean).length;
            score += (facilityCount / 4) * 5;
            if (facilityCount >= 3) reasons.push('Comprehensive facilities');

            return {
                hospitalId: h._id,
                hospitalName: h.name,
                city: h.city,
                rating: h.rating,
                matchScore: Math.round(score),
                reason: reasons.slice(0, 2).join(' · '),
                specialties: h.specialties,
                cashlessAvailable: h.cashlessAvailable,
                coveragePct: h.coveragePct,
                insuranceCompany: h.insuranceCompany
            };
        });

        // Sort by match score
        let results = scoredHospitals.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

        // Filter for insurance if requested
        let insuranceFiltered = false;
        if (insuranceCompany) {
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
        console.error('Recommendation Error:', error);
        return { type: 'error', message: 'Failed to generate recommendations' };
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

        // 1. Check for Hospital Recommendation Intent
        const recKeywords = ['recommend', 'best hospital', 'find hospital', 'hospital for', 'where should i go'];
        if (recKeywords.some(k => queryLower.includes(k))) {
            const recs = await recommendHospitals(query, patientInfo, insuranceCompany);
            return res.json(recs);
        }

        // 2. Check Medical KB matches
        const kbMatch = MEDICAL_KB.find(entry =>
            entry.keywords.some(k => queryLower.includes(k.toLowerCase()))
        );

        if (kbMatch) {
            return res.json({
                type: 'medical_info',
                answer: kbMatch.answer,
                category: kbMatch.category,
                severity: kbMatch.severity
            });
        }

        // 3. Rule-based local fallback instead of AI
        let fallbackAnswer = "I'm sorry, I couldn't find a specific answer in my medical knowledge base for that query.";
        let category = 'General Info';

        if (queryLower.includes('doctor') || queryLower.includes('appointment')) {
            fallbackAnswer = "To book an appointment, go to your Patient Dashboard and select the 'Find Doctors' tab. You can browse specialists and book instantly.";
        } else if (queryLower.includes('insurance') || queryLower.includes('mediclaim')) {
            fallbackAnswer = "We partner with HDFC ERGO and Niva Bupa to provide cashless treatments. You can see the network status on hospital search results.";
        } else if (queryLower.includes('ambulance') || queryLower.includes('emergency')) {
            fallbackAnswer = "For emergencies, use the 'Book Ambulance' feature in your dashboard or call 112 immediately. Our network provides 24/7 trauma support.";
        }

        res.json({
            type: 'medical_info',
            answer: fallbackAnswer,
            category: category,
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
