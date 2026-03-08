/**
 * spellCheck.js
 * Simple medical spell-check utility using string distance matching.
 * Corrects common misspellings of medical terms.
 */

// Dictionary of commonly misspelled medical terms → correct spellings
const MEDICAL_TERMS = [
    'diabetes', 'hypertension', 'cholesterol', 'pneumonia', 'diarrhea',
    'arthritis', 'asthma', 'migraine', 'allergy', 'allergic', 'anemia',
    'thyroid', 'vaccine', 'vaccination', 'antibiotic', 'paracetamol',
    'ibuprofen', 'insulin', 'hemoglobin', 'creatinine', 'bilirubin',
    'appendicitis', 'bronchitis', 'tonsillitis', 'hepatitis', 'gastritis',
    'dermatitis', 'sinusitis', 'meningitis', 'encephalitis',
    'epilepsy', 'seizure', 'paralysis', 'sciatica', 'osteoporosis',
    'tuberculosis', 'malaria', 'dengue', 'typhoid', 'chikungunya',
    'pregnancy', 'gynecology', 'obstetrics', 'pediatric', 'psychiatry',
    'ophthalmology', 'orthopedics', 'cardiology', 'neurology', 'urology',
    'oncology', 'endocrinology', 'nephrology', 'dermatology', 'pulmonology',
    'gastroenterology', 'rheumatology', 'radiology', 'pathology',
    'chemotherapy', 'radiation', 'biopsy', 'ultrasound', 'mammogram',
    'colonoscopy', 'endoscopy', 'echocardiogram', 'electrocardiogram',
    'hemorrhage', 'hemorrhoids', 'hernia', 'fracture', 'dislocation',
    'concussion', 'dehydration', 'constipation', 'nausea', 'vomiting',
    'fatigue', 'insomnia', 'vertigo', 'tinnitus', 'cataract', 'glaucoma',
    'psoriasis', 'eczema', 'urticaria', 'anaphylaxis', 'conjunctivitis',
    'gallstone', 'kidney', 'liver', 'pancreas', 'spleen',
    'prostate', 'cervical', 'ovarian', 'uterine', 'testicular',
    'leukemia', 'lymphoma', 'melanoma', 'carcinoma', 'sarcoma',
    'hypertension', 'hypotension', 'tachycardia', 'bradycardia',
    'hypothyroid', 'hyperthyroid', 'hyperglycemia', 'hypoglycemia',
    'pcos', 'pcod', 'endometriosis', 'fibroids', 'infertility',
    'anxiety', 'depression', 'bipolar', 'schizophrenia', 'ptsd',
    'dyslexia', 'autism', 'adhd', 'dementia', 'alzheimer',
    'parkinson', 'multiple sclerosis', 'cerebral palsy',
    'spondylosis', 'scoliosis', 'osteoarthritis', 'rheumatoid',
    'gout', 'lupus', 'fibromyalgia', 'celiac', 'crohn',
    'colitis', 'diverticulitis', 'pancreatitis', 'cirrhosis',
    'jaundice', 'anorexia', 'bulimia', 'obesity', 'malnutrition',
    'stroke', 'embolism', 'thrombosis', 'aneurysm', 'atherosclerosis',
    'arrhythmia', 'atrial fibrillation', 'myocardial infarction',
    'prescription', 'medication', 'symptoms', 'diagnosis', 'prognosis',
    'treatment', 'surgery', 'emergency', 'ambulance', 'hospital',
    'doctor', 'specialist', 'consultation', 'appointment',
    'headache', 'stomach', 'chest pain', 'back pain', 'fever'
];

/**
 * Calculate Levenshtein distance between two strings.
 */
function levenshteinDistance(a, b) {
    const m = a.length;
    const n = b.length;

    if (m === 0) return n;
    if (n === 0) return m;

    // Use single-row optimization
    let prev = Array.from({ length: n + 1 }, (_, i) => i);
    let curr = new Array(n + 1);

    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(
                prev[j] + 1,       // deletion
                curr[j - 1] + 1,   // insertion
                prev[j - 1] + cost // substitution
            );
        }
        [prev, curr] = [curr, prev];
    }

    return prev[n];
}

/**
 * Find the closest medical term for a possibly misspelled word.
 * Returns the corrected word if a close match is found, otherwise the original.
 */
function correctWord(word) {
    const lower = word.toLowerCase();

    // If already a known term, return as-is
    if (MEDICAL_TERMS.includes(lower)) return lower;

    // Only attempt correction for words >= 4 characters
    if (lower.length < 4) return lower;

    let bestMatch = null;
    let bestDistance = Infinity;

    // Max allowed distance scales with word length
    const maxDistance = lower.length <= 5 ? 1 : 2;

    for (const term of MEDICAL_TERMS) {
        // Quick filter: skip terms with very different lengths
        if (Math.abs(term.length - lower.length) > maxDistance) continue;

        const dist = levenshteinDistance(lower, term);
        if (dist < bestDistance && dist <= maxDistance) {
            bestDistance = dist;
            bestMatch = term;
        }
    }

    return bestMatch || lower;
}

/**
 * Auto-correct a full query string.
 * Returns the corrected query and whether any corrections were made.
 */
function autocorrectQuery(query) {
    const tokens = query.toLowerCase().trim().split(/\s+/);
    let corrected = false;
    const correctedTokens = tokens.map(token => {
        const fixed = correctWord(token);
        if (fixed !== token.toLowerCase()) corrected = true;
        return fixed;
    });

    return {
        original: query,
        corrected: correctedTokens.join(' '),
        wasCorrected: corrected
    };
}

module.exports = { autocorrectQuery, correctWord, MEDICAL_TERMS };
