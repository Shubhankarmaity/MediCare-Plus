const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { MEDICAL_KB } = require('../medicalKnowledge');

const axios = require('axios');

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

        // Fetch the genuine database IDs for these hospitals from our MongoDB
        // Since the dataset might have slightly different names than our db, 
        // we map them by matching the name or falling back to a subset match
        if (results && results.length > 0) {
            const hospitalNames = results.map(h => h.hospitalName);
            const dbHospitals = await Hospital.find({
                name: { $in: hospitalNames },
                networkStatus: 'Active'
            });

            // Re-map the IDs
            results = results.map(rec => {
                const searchName = rec.hospitalName.toLowerCase().trim();

                // 1. Exact case-insensitive match
                let matchedDbHospital = dbHospitals.find(db =>
                    db.name.toLowerCase().trim() === searchName
                );

                // 2. Partial match (if dataset has "LifeLine Hospital" and DB has "Lifeline Hospital Barrackpore")
                if (!matchedDbHospital) {
                    matchedDbHospital = dbHospitals.find(db => {
                        const dbName = db.name.toLowerCase().trim();
                        return dbName.includes(searchName) || searchName.includes(dbName);
                    });
                }

                // 3. Very loose match (split first two words)
                if (!matchedDbHospital && searchName.split(' ').length > 1) {
                    const looseSearch = searchName.split(' ').slice(0, 2).join(' ');
                    matchedDbHospital = dbHospitals.find(db =>
                        db.name.toLowerCase().includes(looseSearch)
                    );
                }

                if (matchedDbHospital) {
                    rec.hospitalId = matchedDbHospital._id;
                }
                return rec;
            });

            // Remove any hospitals we couldn't link to the live DB
            results = results.filter(rec => rec.hospitalId != null);
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

        // 1. Check for Hospital Recommendation Intent or Symptom matching
        const recKeywords = [
            'recommend', 'recomend', 'best hospital', 'find hospital', 'hospital for',
            'hospital of', 'where should i go', 'need a hospital', 'suggest', 'looking for hospital'
        ];
        const medicalKeywords = [
            'chest pain', 'heart', 'kidney', 'cancer', 'ortho', 'surgery', 'diabetes', 'sugar',
            'neuro', 'neurology', 'brain', 'eye', 'dental', 'teeth', 'skin', 'derma', 'stomach',
            'gastro', 'pediatric', 'child', 'baby', 'maternity', 'gynecology', 'women', 'ent',
            'ear', 'nose', 'throat', 'lung', 'asthma', 'breathing', 'fever', 'infection'
        ];

        const isRecommendation = recKeywords.some(k => queryLower.includes(k)) ||
            medicalKeywords.some(k => queryLower.includes(k));

        let recsResponse = null;
        if (isRecommendation) {
            recsResponse = await recommendHospitals(query, patientInfo, insuranceCompany);
        }

        // 2. Check Medical KB matches (for text answers)
        const kbMatch = MEDICAL_KB.find(entry =>
            entry.keywords.some(k => queryLower.includes(k.toLowerCase()))
        );

        if (recsResponse && recsResponse.hospitals && recsResponse.hospitals.length > 0) {
            // We have hospital recs! Let's combine it with the KB match if one exists.
            if (kbMatch) {
                recsResponse.answer = kbMatch.answer; // Optionally attach the text answer to the hospitals dict
                // We still return "hospital_recommendation" type so frontend renders cards
            }
            return res.json(recsResponse);
        }

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
