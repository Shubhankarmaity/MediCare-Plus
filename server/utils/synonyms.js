/**
 * synonyms.js
 * Medical synonym/abbreviation dictionary and query expansion utility.
 * Helps the chatbot understand common abbreviations and colloquial terms.
 */

const MEDICAL_SYNONYMS = {
    // Abbreviations → full terms
    'bp': 'blood pressure',
    'sugar': 'blood sugar diabetes glucose',
    'hr': 'heart rate',
    'ecg': 'electrocardiogram heart',
    'ekg': 'electrocardiogram heart',
    'ct': 'ct scan',
    'mri': 'mri scan',
    'icu': 'intensive care unit',
    'ot': 'operation theatre surgery',
    'opd': 'outpatient department',
    'ipd': 'inpatient department',
    'er': 'emergency room',
    'ent': 'ear nose throat',
    'ob': 'obstetrics pregnancy',
    'gyn': 'gynecology',
    'obgyn': 'obstetrics gynecology',
    'ortho': 'orthopedics bone joint',
    'neuro': 'neurology brain nerve',
    'cardio': 'cardiology heart',
    'gastro': 'gastroenterology stomach digestive',
    'pulmo': 'pulmonology lung respiratory',
    'nephro': 'nephrology kidney',
    'derma': 'dermatology skin',
    'onco': 'oncology cancer tumor',
    'uro': 'urology urinary',
    'pedia': 'pediatrics child',
    'psych': 'psychiatry mental health',
    'physio': 'physiotherapy physical therapy',

    // Colloquial → medical
    'tummy': 'stomach abdominal',
    'tummy ache': 'stomach pain abdominal',
    'belly': 'stomach abdominal',
    'belly ache': 'stomach pain abdominal',
    'motion': 'diarrhea stool bowel',
    'loose motion': 'diarrhea loose stool',
    'potty': 'stool bowel movement',
    'pee': 'urine urination',
    'peeing problem': 'urinary difficulty urination',
    'cold': 'common cold fever cough',
    'flu': 'influenza fever body ache',
    'throwing up': 'vomiting nausea',
    'puking': 'vomiting nausea',
    'fits': 'seizure epilepsy convulsion',
    'sugar problem': 'diabetes blood sugar',
    'high sugar': 'hyperglycemia diabetes',
    'low sugar': 'hypoglycemia blood sugar low',
    'breathing problem': 'shortness of breath respiratory',
    'cant breathe': 'shortness of breath breathlessness',
    'heart racing': 'palpitations heart rate fast',
    'chest tight': 'chest pain tightness angina',
    'dizzy': 'dizziness vertigo lightheaded',
    'giddy': 'dizziness vertigo',
    'blackout': 'fainting syncope unconscious',
    'fainting': 'syncope unconscious',
    'rashes': 'rash skin dermatitis',
    'pimples': 'acne pimple skin',
    'balding': 'hair loss alopecia',
    'hair fall': 'hair loss alopecia',
    'periods': 'menstrual period menstruation',
    'irregular periods': 'menstrual irregularity pcos',
    'period cramps': 'dysmenorrhea period pain',
    'eye problem': 'vision eye ophthalmology',
    'hearing problem': 'hearing loss ear',
    'teeth problem': 'dental tooth teeth',
    'back problem': 'back pain spine lumbar',
    'knee problem': 'knee pain joint arthritis',
    'bone break': 'fracture broken bone',
    'gas': 'bloating gas flatulence',
    'gastric': 'acidity gastric acid reflux',
    'acidity': 'acid reflux gerd heartburn',

    // Indian English / Hindi-English
    'pet dard': 'stomach pain abdominal',
    'sir dard': 'headache head pain',
    'bukhar': 'fever temperature',
    'khasi': 'cough',
    'ulti': 'vomiting nausea',
    'dast': 'diarrhea loose stool',
    'neend': 'sleep insomnia',
    'suger': 'diabetes blood sugar',
    'bp high': 'hypertension high blood pressure',
    'bp low': 'hypotension low blood pressure',
};

/**
 * Expand a user query with synonym/abbreviation mappings.
 * Returns the original query plus any expanded terms.
 */
function expandQuery(query) {
    const lower = query.toLowerCase().trim();
    const tokens = lower.split(/\s+/);
    let expanded = lower;

    // Check full query first (for multi-word matches)
    if (MEDICAL_SYNONYMS[lower]) {
        expanded += ' ' + MEDICAL_SYNONYMS[lower];
    }

    // Check individual tokens
    for (const token of tokens) {
        if (MEDICAL_SYNONYMS[token] && !expanded.includes(MEDICAL_SYNONYMS[token])) {
            expanded += ' ' + MEDICAL_SYNONYMS[token];
        }
    }

    // Check bigrams (two-word combinations)
    for (let i = 0; i < tokens.length - 1; i++) {
        const bigram = tokens[i] + ' ' + tokens[i + 1];
        if (MEDICAL_SYNONYMS[bigram] && !expanded.includes(MEDICAL_SYNONYMS[bigram])) {
            expanded += ' ' + MEDICAL_SYNONYMS[bigram];
        }
    }

    return expanded;
}

module.exports = { MEDICAL_SYNONYMS, expandQuery };
