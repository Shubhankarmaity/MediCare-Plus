/**
 * llmFallback.js
 * Google Gemini fallback service for MediBot when KB has no coverage.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('./logger');

// Initialize Gemini client if API key is provided
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({
            model: 'gemini-3.5-flash',
            generationConfig: {
                temperature: 0.4, // Keep it clinical and factual
                maxOutputTokens: 400,
            }
        });
        console.log('✅ Gemini LLM Fallback initialized successfully');
    } catch (err) {
        console.error('❌ Failed to initialize Gemini Client:', err.message);
    }
} else {
    console.warn('⚠️ GEMINI_API_KEY not found in environment variables. Fallback LLM will not be active.');
}

/**
 * Call Gemini to get an answer to a medical or site-related query.
 * @param {string} query - The user's prompt.
 * @param {object} patientContext - Optional patient context (age, history, allergies).
 * @returns {Promise<object|null>} The formatted response or null if failed.
 */
async function askGemini(query, patientContext = null) {
    if (!model) {
        logger.warn('Gemini model is not initialized. Skipping LLM fallback.');
        return null;
    }

    try {
        let contextPrompt = '';
        if (patientContext) {
            contextPrompt = `
[PATIENT CONTEXT]
- Age/Gender: ${patientContext.age || 'Unknown'}
- Blood Group: ${patientContext.bloodGroup || 'Unknown'}
- Medical History: ${patientContext.medicalHistory || 'None reported'}
- Allergies: ${patientContext.allergies || 'None reported'}
- Current Prescriptions: ${JSON.stringify(patientContext.prescriptions || [])}
`;
        }

        const systemPrompt = `You are MediBot, the intelligent medical assistant and site navigator for the "MediCare Plus" digital healthcare platform.

RULES:
1. Provide highly accurate, empathetic, and clinical medical information.
2. Under no circumstances should you diagnose a condition or prescribe specific drug dosages.
3. If patient context is provided, tailor your response's warnings/advice (e.g., alert them if their query interacts with their existing allergies or history).
4. If a query describes a critical emergency (e.g., severe chest pain, stroke symptoms, major bleeding, severe breathing difficulty), you MUST start your response with: "🚨 **EMERGENCY WARNING:** Call 112 or go to the nearest emergency room immediately."
5. Suggest relevant medical specialties (e.g., Cardiology, Endocrinology, Pediatrics) if they need to see a doctor.
6. Keep answers concise, formatted in clean markdown, and easy to read for patients.
7. Only answer medical, health, wellness, first aid, or platform-related questions. If the user asks something completely unrelated (e.g., coding, politics, cooking), politely decline by stating you are a dedicated medical assistant.

${contextPrompt}

User Query: "${query}"
`;

        let result = null;
        let retries = 3;
        let retryDelay = 1000;

        while (retries > 0) {
            try {
                result = await model.generateContent(systemPrompt);
                break;
            } catch (err) {
                retries--;
                if (retries === 0) throw err;
                logger.warn(`Gemini API call failed. Retrying in ${retryDelay}ms... (Retries left: ${retries}). Error: ${err.message}`);
                await new Promise(r => setTimeout(r, retryDelay));
                retryDelay *= 2;
            }
        }

        const responseText = result.response.text();

        // Categorize response dynamically based on keywords in response/query
        let category = 'General Health';
        let severity = 'info';

        const textLower = responseText.toLowerCase();
        const queryLower = query.toLowerCase();

        if (textLower.includes('emergency') || textLower.includes('112') || textLower.includes('immediate medical attention')) {
            severity = 'danger';
            category = 'Urgent / Emergency';
        } else if (textLower.includes('caution') || textLower.includes('warning') || textLower.includes('side effect') || textLower.includes('avoid')) {
            severity = 'caution';
        }

        // Determine category mapping
        if (queryLower.includes('heart') || queryLower.includes('cardio') || queryLower.includes('chest')) {
            category = 'Cardiovascular';
        } else if (queryLower.includes('sugar') || queryLower.includes('diabet') || queryLower.includes('insulin')) {
            category = 'Endocrinology';
        } else if (queryLower.includes('kidney') || queryLower.includes('renal') || queryLower.includes('urine')) {
            category = 'Nephrology';
        } else if (queryLower.includes('stomach') || queryLower.includes('vomit') || queryLower.includes('diarrh') || queryLower.includes('gas')) {
            category = 'Gastroenterology';
        } else if (queryLower.includes('skin') || queryLower.includes('rash') || queryLower.includes('acne') || queryLower.includes('itch')) {
            category = 'Dermatology';
        } else if (queryLower.includes('brain') || queryLower.includes('stroke') || queryLower.includes('headache') || queryLower.includes('seiz')) {
            category = 'Neurology';
        } else if (queryLower.includes('child') || queryLower.includes('baby') || queryLower.includes('pedia')) {
            category = 'Pediatrics';
        } else if (queryLower.includes('pregnant') || queryLower.includes('period') || queryLower.includes('gynec')) {
            category = 'Obstetrics & Gynecology';
        }

        return {
            type: 'medical_info',
            answer: responseText.trim(),
            category,
            severity,
            confidence: 90, // LLM confidence is high for coherent responses
            matchSource: 'llm_fallback'
        };
    } catch (err) {
        logger.error('Error calling Gemini API:', err);
        return null;
    }
}

module.exports = { askGemini };
