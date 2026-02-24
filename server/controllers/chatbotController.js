const User = require('../models/User');
const Hospital = require('../models/Hospital');
const { MEDICAL_KB } = require('../medicalKnowledge');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

        // 1. Check for Information Intents first (Questions meant for Gemini)
        const infoKeywords = [
            'what is', 'what are', 'how to', 'how do', 'explain', 'tell me about', 'symptoms of', 'cause of', 'definition'
        ];
        const isInfoQuery = infoKeywords.some(k => queryLower.includes(k));

        // 2. Check for Hospital Recommendation Intent or Symptom matching
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

        // It is a recommendation IF it contains recKeywords OR (it contains medicalKeywords AND it is NOT a direct information question)
        const isRecommendation = recKeywords.some(k => queryLower.includes(k)) ||
            (medicalKeywords.some(k => queryLower.includes(k)) && !isInfoQuery);

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

        // 2. If it's not a recommendation intent, bypass static KB and use Google Gemini!
        if (!process.env.GEMINI_API_KEY) {
            return res.json({
                type: 'medical_info',
                answer: "I am MediBot. (Gemini API Key missing). To book an appointment, go to your Patient Dashboard.",
                category: 'General Info',
                severity: 'info'
            });
        }

        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `You are MediBot, an expert AI Healthcare Assistant for the 'MediCare Plus' hospital booking platform.
User query: "${query}"

Guidelines:
1. Provide a concise, empathetic, and medically accurate response (keep it under 3 short paragraphs).
2. Use Markdown formatting (bolding, bullet points) and emojis to make it readable.
3. If they ask about platform features (like "how many hospitals", "how to book"), instruct them to use the "Hospital Search" or "Find Doctors" tabs in their dashboard.
4. If providing health advice, subtly include a disclaimer that you are an AI and they should consult a doctor on our platform for serious issues.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            return res.json({
                type: 'medical_info',
                answer: responseText,
                category: 'AI Assistant',
                severity: 'info'
            });

        } catch (geminiError) {
            console.error('Gemini API Error:', geminiError);
            return res.json({
                type: 'medical_info',
                answer: "I'm sorry, my AI processing engine is currently experiencing high load. Please try asking your question again in a moment.",
                category: 'System Error',
                severity: 'caution'
            });
        }

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
