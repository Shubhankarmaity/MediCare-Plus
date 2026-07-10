/**
 * symptomChecker.js
 * Decision tree configurations and runner for MediBot's interactive Symptom Checker.
 */

const SYMPTOM_TREE = {
    'headache': {
        question: 'How severe is the headache?',
        options: [
            { label: 'Mild / Moderate', next: 'headache_mild' },
            { label: 'Severe (sudden, severe or "worst ever")', next: 'headache_severe' }
        ]
    },
    'headache_severe': {
        question: 'Do you also have a stiff neck, high fever, double vision, or confusion?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Potential Meningitis or Subarachnoid Hemorrhage', severity: 'danger', advice: '🚨 **EMERGENCY WARNING:** Please seek immediate emergency medical care (Call 112). These symptoms require immediate hospital evaluation.', actions: ['ambulance'] } },
            { label: 'No', result: { diagnosis: 'Severe Migraine or Cluster Headache', severity: 'caution', advice: 'Take Paracetamol and rest in a quiet, dark room. If this is a new type of headache or persists for more than 24 hours, seek a Neurologist.', actions: ['appointment', 'neurology'] } }
        ]
    },
    'headache_mild': {
        question: 'Is the pain throbbing/pulsating on one side of the head, or does it feel like a tight band around the forehead?',
        options: [
            { label: 'One side & throbbing', result: { diagnosis: 'Migraine Headache', severity: 'info', advice: 'Try to rest in a dark room, stay hydrated, and take a mild pain reliever like Paracetamol. Avoid bright lights, strong smells, and noise. See a Neurologist if frequent.', actions: ['appointment', 'neurology'] } },
            { label: 'Tight band all over', result: { diagnosis: 'Tension Headache', severity: 'info', advice: 'Likely caused by stress, lack of sleep, poor posture, or eye strain. Try gentle stretching, hydrate, and take a mild pain reliever if needed.', actions: ['appointment', 'general'] } }
        ]
    },
    'chest pain': {
        question: 'Is the chest pain described as pressure, squeezing, or heaviness, and does it radiate to your left arm, neck, jaw, or back?',
        options: [
            { label: 'Yes (radiating pressure)', next: 'chest_pain_radiating' },
            { label: 'No (sharp, burning, or worse when touched)', next: 'chest_pain_non_radiating' }
        ]
    },
    'chest_pain_radiating': {
        question: 'Are you also experiencing shortness of breath, cold sweats, dizziness, or nausea?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Potential Acute Coronary Syndrome (Heart Attack)', severity: 'danger', advice: '🚨 **CRITICAL EMERGENCY WARNING:** Call 112 immediately. Do not drive yourself. Sit upright, rest, and keep calm while help arrives.', actions: ['ambulance'] } },
            { label: 'No', result: { diagnosis: 'Possible Cardiac Chest Pain (Angina)', severity: 'danger', advice: '🚨 **EMERGENCY WARNING:** Sit down and rest immediately. If the pain persists for more than 5 minutes or worsens, call 112. Otherwise, consult a Cardiologist today for an ECG/Troponin test.', actions: ['ambulance', 'appointment', 'cardiology'] } }
        ]
    },
    'chest_pain_non_radiating': {
        question: 'Does the pain feel like a burning sensation behind the breastbone that worsens when lying down or after eating?',
        options: [
            { label: 'Yes (burning / worse when lying down)', result: { diagnosis: 'Likely Gastroesophageal Reflux (GERD) / Heartburn', severity: 'info', advice: 'Avoid lying down for 3 hours after eating. Try taking an antacid or Pantoprazole. If symptoms persist or happen frequently, consult a Gastroenterologist.', actions: ['appointment', 'gastroenterology'] } },
            { label: 'No (sharp pain worse when deep breathing/pressing)', result: { diagnosis: 'Likely Pleuritic or Musculoskeletal Pain', severity: 'info', advice: 'This could be muscle strain or inflammation of the rib cartilage (costochondritis). Rest, apply warm compression, and take ibuprofen. See a General Physician if pain continues.', actions: ['appointment', 'general'] } }
        ]
    },
    'fever': {
        question: 'Is the fever accompanied by severe chills/shivering, full-body ache, or a skin rash?',
        options: [
            { label: 'Yes', next: 'fever_rash_chills' },
            { label: 'No', next: 'fever_simple' }
        ]
    },
    'fever_rash_chills': {
        question: 'Is the fever very high, and are you noticing any red spots/rash on your skin or bleeding gums?',
        options: [
            { label: 'Yes (extreme fever + rash/bleeding)', result: { diagnosis: 'Possible Severe Dengue Fever', severity: 'danger', advice: '🚨 **Seek immediate medical attention.** This could indicate Dengue Hemorrhagic Fever. Monitor platelet levels closely. Do NOT take Aspirin/Ibuprofen; take Paracetamol only.', actions: ['ambulance', 'appointment', 'general'] } },
            { label: 'No', result: { diagnosis: 'Possible Malaria or Typhoid', severity: 'caution', advice: 'Ensure regular hydration with ORS. Schedule a blood CBC, Malaria Antigen, and Widal test. Consult a General Physician for diagnosis and antimalarials/antibiotics.', actions: ['appointment', 'general'] } }
        ]
    },
    'fever_simple': {
        question: 'Has the body temperature exceeded 39.5°C (103°F) or has the fever lasted for more than 3 days?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Prolonged or High Grade Fever', severity: 'caution', advice: 'Keep hydration high, use lukewarm water sponging to bring down temperature, and consult a doctor for a thorough evaluation and blood profile.', actions: ['appointment', 'general'] } },
            { label: 'No', result: { diagnosis: 'Likely Acute Viral Fever / Cold', severity: 'info', advice: 'Take Paracetamol, drink plenty of water, rest, and keep warm. It should resolve on its own in 2-3 days.', actions: ['appointment', 'general'] } }
        ]
    },
    'stomach pain': {
        question: 'Is the pain severe, sharp, and localized in the lower right side of your stomach?',
        options: [
            { label: 'Yes', next: 'stomach_right' },
            { label: 'No', next: 'stomach_diffuse' }
        ]
    },
    'stomach_right': {
        question: 'Does the pain worsen when you press and release the spot (rebound tenderness), or is it accompanied by vomiting?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Suspected Appendicitis', severity: 'danger', advice: '🚨 **EMERGENCY WARNING:** Go to the nearest emergency room immediately. This may be appendicitis. Do NOT eat, drink, or take laxatives, as this could cause rupture.', actions: ['ambulance'] } },
            { label: 'No', result: { diagnosis: 'Possible Right Iliac Fossa Pain (Hernia/Ovarian)', severity: 'caution', advice: 'Consult a general surgeon or gynecologist for abdominal examination/ultrasound. Rest and avoid lifting weights.', actions: ['appointment', 'general'] } }
        ]
    },
    'stomach_diffuse': {
        question: 'Is the stomach pain accompanied by frequent loose/watery stools or vomiting?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Gastroenteritis / Food Poisoning', severity: 'caution', advice: 'Rehydrate immediately with ORS (Oral Rehydration Salts) or coconut water. Eat bland foods (bananas, rice). Avoid dairy and greasy foods. Consult a doctor if stools contain blood.', actions: ['appointment', 'gastroenterology'] } },
            { label: 'No', result: { diagnosis: 'Indigestion / Acidity / Bloating', severity: 'info', advice: 'Avoid spicy and fatty foods. Take an antacid. Stay upright for 2 hours after meals. Drink lukewarm water.', actions: ['appointment', 'gastroenterology'] } }
        ]
    },
    'breathing difficulty': {
        question: 'Are you struggling to speak in full sentences, or are your lips/fingertips turning blue?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Severe Respiratory Distress / Hypoxia', severity: 'danger', advice: '🚨 **CRITICAL EMERGENCY WARNING:** Call 112 immediately. Sit upright, open windows for fresh air, and utilize emergency oxygen or inhalers if prescribed.', actions: ['ambulance'] } },
            { label: 'No', next: 'breathing_moderate' }
        ]
    },
    'breathing_moderate': {
        question: 'Do you have a history of asthma or COPD, and is there an active wheezing/whistling sound?',
        options: [
            { label: 'Yes', result: { diagnosis: 'Asthma or COPD Flare-up', severity: 'caution', advice: 'Use your rescue inhaler (Salbutamol) immediately (2 puffs). Sit upright and rest. If no improvement within 15 minutes, repeat puffs and contact a doctor or call 112.', actions: ['ambulance', 'appointment', 'pulmonology'] } },
            { label: 'No (accompanied by chest tightness or cough)', result: { diagnosis: 'Possible Bronchitis, Pneumonia, or Anxiety', severity: 'caution', advice: 'Consult a Pulmonologist or General Physician immediately. If you have fever and cough with phlegm, chest imaging (X-ray) may be required.', actions: ['appointment', 'pulmonology'] } }
        ]
    }
};

/**
 * Handle a step in the symptom checker.
 * @param {string} nodeId - Current step ID (e.g. 'headache' or 'headache_severe')
 * @param {string} optionLabel - Optional selected button label (user's input)
 * @returns {object} The next question or result node.
 */
function getSymptomNode(nodeId, optionLabel = null) {
    const currentNode = SYMPTOM_TREE[nodeId.toLowerCase()];
    if (!currentNode) return null;

    if (!optionLabel) {
        return {
            nodeId,
            question: currentNode.question,
            options: currentNode.options ? currentNode.options.map(o => o.label) : []
        };
    }

    // Find the chosen option
    const chosenOption = currentNode.options?.find(o => o.label.toLowerCase() === optionLabel.toLowerCase());
    if (!chosenOption) return null;

    if (chosenOption.result) {
        return {
            isFinal: true,
            ...chosenOption.result
        };
    }

    if (chosenOption.next) {
        const nextNode = SYMPTOM_TREE[chosenOption.next];
        return {
            nodeId: chosenOption.next,
            question: nextNode.question,
            options: nextNode.options ? nextNode.options.map(o => o.label) : []
        };
    }

    return null;
}

module.exports = { getSymptomNode, SYMPTOM_TREE };
