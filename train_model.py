import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors
import joblib
import json

# ── Symptom ↔ Specialty mapping ──────────────────────────────────────────────
SYMPTOM_MAP = {
    'cardiology': ['heart', 'chest pain', 'cardiac', 'bp', 'hypertension', 'cardiovascular', 'coronary', 'palpitations', 'angina'],
    'orthopedics': ['bone', 'joint pain', 'fracture', 'arthritis', 'knee', 'spine', 'back pain', 'scoliosis', 'sports injury', 'ligament'],
    'neurology': ['brain', 'nerve', 'head', 'stroke', 'migraine', 'paralysis', 'seizure', 'epilepsy', 'alzheimer', 'dizziness', 'numbness'],
    'oncology': ['cancer', 'tumor', 'chemo', 'radiation', 'malignant', 'biopsy', 'lymphoma', 'leukemia'],
    'emergency care': ['accident', 'trauma', 'emergency', 'injury', 'critical', 'sudden', 'bleeding', 'burn', 'poisoning', 'unconscious'],
    'pediatrics': ['child', 'baby', 'infant', 'kid', 'vaccination', 'neonatal', 'newborn', 'growth'],
    'gynecology': ['pregnancy', 'woman', 'birth', 'period', 'menstrual', 'female', 'ivf', 'prenatal', 'cesarean', 'maternity'],
    'endocrinology': ['diabetes', 'sugar', 'thyroid', 'hormone', 'insulin', 'pcos', 'adrenal'],
    'nephrology': ['kidney', 'dialysis', 'stone', 'renal', 'urinary'],
    'kidney care': ['kidney', 'dialysis', 'stone', 'renal', 'urinary', 'creatinine'],
    'urology': ['kidney stone', 'prostate', 'bladder', 'urinary tract', 'ureteroscopy'],
    'pulmonology': ['lung', 'asthma', 'breath', 'coughing', 'covid', 'chest', 'copd', 'tb', 'tuberculosis', 'respiratory', 'pneumonia'],
    'gastroenterology': ['stomach', 'liver', 'gut', 'intestine', 'digestion', 'colon', 'acidity', 'ulcer', 'jaundice', 'constipation'],
    'dermatology': ['skin', 'rash', 'eczema', 'psoriasis', 'acne', 'allergy', 'itching', 'fungal'],
    'ophthalmology': ['eye', 'vision', 'cataract', 'glaucoma', 'retina', 'lasik', 'blindness'],
    'psychiatry': ['mental', 'depression', 'anxiety', 'stress', 'insomnia', 'bipolar', 'addiction', 'panic'],
    'ent': ['ear', 'nose', 'throat', 'tonsil', 'sinus', 'hearing', 'deafness', 'snoring', 'voice'],
    'general medicine': ['fever', 'infection', 'flu', 'cold', 'cough', 'weakness', 'fatigue', 'checkup', 'body pain'],
    'general surgery': ['surgery', 'appendix', 'hernia', 'gallbladder', 'laparoscopy', 'abscess'],
    'physiotherapy': ['rehabilitation', 'physiotherapy', 'recovery', 'sports injury', 'muscle pain', 'stiffness'],
}

print("Loading dataset...")
df = pd.read_csv('hospital_recommendation_dataset.csv')
print(f"  → {len(df)} hospitals, {len(df.columns)} columns")

print("Preprocessing features...")

def create_hospital_profile(row):
    """Build a rich text profile per hospital combining specialties, treatments,
    facilities, and expanded symptom synonyms for better TF-IDF matching."""
    features = []

    # --- Specialties (repeated 3x for heavy weighting) ---
    specialties_str = str(row.get('specialties', ''))
    for _ in range(3):
        features.append(specialties_str)

    # --- Available treatments (repeated 2x) ---
    treatments_str = str(row.get('available_treatments', ''))
    for _ in range(2):
        features.append(treatments_str)

    # --- Facility keywords ---
    if str(row.get('ICU', '')).strip().lower() == 'yes':
        features.append('ICU intensive care critical care')
    if str(row.get('Emergency', '')).strip().lower() == 'yes':
        features.append('Emergency emergency trauma 24x7')
    if str(row.get('Operation_Theatre', '')).strip().lower() == 'yes':
        features.append('Operation Theatre surgery OT')
    if str(row.get('cashless_available', '')).strip().lower() == 'yes':
        features.append('Cashless insurance claim mediclaim')
    if str(row.get('blood_bank', '')).strip().lower() == 'yes':
        features.append('blood bank transfusion')
    if str(row.get('diagnostic_lab', '')).strip().lower() == 'yes':
        features.append('diagnostic lab pathology test')
    if str(row.get('pharmacy_available', '')).strip().lower() == 'yes':
        features.append('pharmacy medicine')
    if str(row.get('NABH_accredited', '')).strip().lower() == 'yes':
        features.append('NABH accredited quality certified')

    # --- Insurance company ---
    ins = row.get('insurance_company', '') or ''
    features.append(str(ins))

    # --- Hospital type ---
    features.append(str(row.get('hospital_type', '')))

    # --- Quality signals as categorical tokens ---
    rating = float(row.get('rating', 0) or 0)
    if rating >= 4.5:
        features.append('top rated excellent')
    elif rating >= 4.0:
        features.append('well rated good')

    satisfaction = int(row.get('patient_satisfaction_pct', 0) or 0)
    if satisfaction >= 85:
        features.append('high satisfaction recommended')

    doctor_count = int(row.get('doctor_count', 0) or 0)
    if doctor_count >= 50:
        features.append('large hospital many doctors')
    elif doctor_count >= 30:
        features.append('medium hospital')

    icu_beds = int(row.get('icu_beds', 0) or 0)
    if icu_beds >= 15:
        features.append('advanced icu high capacity critical care')
    elif icu_beds >= 5:
        features.append('icu available')

    # --- Symptom synonym expansion ---
    spec_lower = specialties_str.lower()
    for specialty, synonyms in SYMPTOM_MAP.items():
        if specialty in spec_lower:
            features.append(' '.join(synonyms))

    return ' '.join(features)

df['hospital_profile'] = df.apply(create_hospital_profile, axis=1)

# TF-IDF with bigrams for multi-word symptom phrases
print("Fitting TF-IDF vectorizer (unigrams + bigrams)...")
vectorizer = TfidfVectorizer(
    stop_words='english',
    ngram_range=(1, 2),
    max_features=5000,
    sublinear_tf=True,        # Apply log normalization to TF — helps with small datasets
)
X_profiles = vectorizer.fit_transform(df['hospital_profile'])
print(f"  → Vocabulary size: {len(vectorizer.vocabulary_)}")

# Train Nearest Neighbors model
k = min(5, len(df))
print(f"Training NearestNeighbors (k={k}, cosine metric)...")
nn_model = NearestNeighbors(n_neighbors=k, metric='cosine')
nn_model.fit(X_profiles)

# Save the model and vectorizer
print("Saving models to disk...")
joblib.dump(nn_model, 'ml_model/hospital_nn_model.pkl')
joblib.dump(vectorizer, 'ml_model/hospital_vectorizer.pkl')

# Save hospital mapping data with richer metadata
hospital_mapping = df[[
    'hospital_id', 'hospital_name', 'city', 'rating', 'specialties',
    'insurance_company', 'cashless_available', 'ICU', 'Emergency',
    'available_treatments', 'hospital_type', 'NABH_accredited',
    'doctor_count', 'wait_time_mins', 'patient_satisfaction_pct',
    'consultation_fee', 'avg_room_cost', 'Beds',
]].to_dict(orient='records')

with open('ml_model/hospital_mapping.json', 'w') as f:
    json.dump(hospital_mapping, f, indent=2)

print(f"Training complete! {len(df)} hospitals, {len(vectorizer.vocabulary_)} vocabulary terms.")
print("Models saved in ml_model/")
