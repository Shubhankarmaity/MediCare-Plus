import os
import json
import traceback
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
import joblib
from pymongo import MongoClient

app = Flask(__name__)

# Global models
nn_model = None
vectorizer = None
hospital_mapping = []

# ── Symptom ↔ Specialty mapping (shared with train_model.py) ─────────────────
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


def _build_hospital_profile(row):
    """Build a rich text profile from a MongoDB hospital document."""
    features = []

    # Specialties (repeated 3x for heavy weighting)
    specialty_str = str(row.get('specialties', ''))
    for _ in range(3):
        features.append(specialty_str)

    # Available treatments (repeated 2x)
    treatments = row.get('availableTreatments', [])
    if isinstance(treatments, list):
        treatments_str = ', '.join(treatments)
    else:
        treatments_str = str(treatments)
    for _ in range(2):
        features.append(treatments_str)

    # Facility keywords
    if row.get('hasICU'):
        features.append('ICU intensive care critical care')
    if row.get('hasEmergency'):
        features.append('Emergency emergency trauma 24x7')
    if row.get('hasOT'):
        features.append('Operation Theatre surgery OT')
    if row.get('cashlessAvailable'):
        features.append('Cashless insurance claim mediclaim')
    if row.get('bloodBank'):
        features.append('blood bank transfusion')
    if row.get('diagnosticLab'):
        features.append('diagnostic lab pathology test')
    if row.get('pharmacyAvailable'):
        features.append('pharmacy medicine')
    if row.get('naabhAccredited'):
        features.append('NABH accredited quality certified')

    ins = row.get('insuranceCompany', '') or ''
    features.append(str(ins))
    features.append(str(row.get('hospitalType', '')))

    # Quality signals as categorical tokens
    rating = float(row.get('rating', 0) or 0)
    if rating >= 4.5:
        features.append('top rated excellent')
    elif rating >= 4.0:
        features.append('well rated good')

    satisfaction = int(row.get('patientSatisfactionPct', 0) or 0)
    if satisfaction >= 85:
        features.append('high satisfaction recommended')

    doctor_count = int(row.get('doctorCount', 0) or 0)
    if doctor_count >= 50:
        features.append('large hospital many doctors')
    elif doctor_count >= 30:
        features.append('medium hospital')

    icu_beds = int(row.get('icuBeds', 0) or 0)
    if icu_beds >= 15:
        features.append('advanced icu high capacity critical care')
    elif icu_beds >= 5:
        features.append('icu available')

    # Symptom synonym expansion
    spec_lower = specialty_str.lower()
    for specialty, synonyms in SYMPTOM_MAP.items():
        if specialty in spec_lower:
            features.append(' '.join(synonyms))

    return ' '.join(features)


def _generate_reason(query, hospital_data, distance):
    """Generate a human-readable explanation for why this hospital was matched."""
    query_lower = query.lower()
    specialties = str(hospital_data.get('specialties', '')).lower()
    reasons = []

    # Find which specialty matched
    for specialty, keywords in SYMPTOM_MAP.items():
        if specialty in specialties and any(kw in query_lower for kw in keywords):
            reasons.append(f"Specializes in {specialty.title()} matching your symptoms")
            break

    # Treatment match
    treatments = hospital_data.get('available_treatments', '')
    if isinstance(treatments, list):
        treatments = ', '.join(treatments)
    treatments_lower = str(treatments).lower()
    query_words = query_lower.split()
    matched_treatments = [w for w in query_words if len(w) > 3 and w in treatments_lower]
    if matched_treatments:
        reasons.append(f"Offers relevant treatments: {', '.join(matched_treatments)}")

    # Quality signals
    rating = float(hospital_data.get('rating', 0) or 0)
    if rating >= 4.5:
        reasons.append(f"Top-rated ({rating}⭐)")
    satisfaction = int(hospital_data.get('patient_satisfaction_pct', 0) or 0)
    if satisfaction >= 85:
        reasons.append(f"{satisfaction}% patient satisfaction")

    if not reasons:
        reasons.append("AI matched hospital features with your symptoms")

    return '. '.join(reasons)


def init_models():
    """Fetches all hospitals from MongoDB and trains the model in memory on startup."""
    global nn_model, vectorizer, hospital_mapping
    
    mongo_uri = os.environ.get('MONGODB_URI')
    if not mongo_uri:
        print("WARNING: MONGODB_URI not set. Attempting to load local .pkl files...")
        try:
            nn_model = joblib.load('ml_model/hospital_nn_model.pkl')
            vectorizer = joblib.load('ml_model/hospital_vectorizer.pkl')
            with open('ml_model/hospital_mapping.json', 'r') as f:
                hospital_mapping = json.load(f)
            print("Loaded local models successfully.")
        except Exception as e:
            print("Failed to load local models:", e)
        return

    print("Connecting to MongoDB to fetch live hospitals for ML initialization...")
    try:
        client = MongoClient(mongo_uri)
        try:
            db = client.get_default_database()
        except Exception:
            db = client['test']

        hospitals = list(db.hospitals.find({}))
        if not hospitals:
            print("No hospitals found in DB.")
            return
            
        print(f"Fetched {len(hospitals)} hospitals. Training models...")
        
        df = pd.DataFrame(hospitals)
        df['hospital_profile'] = df.apply(_build_hospital_profile, axis=1)
        
        # TF-IDF with bigrams and sublinear TF for small-dataset performance
        vec_new = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
        )
        X_profiles = vec_new.fit_transform(df['hospital_profile'])
        
        n_neighbors = min(5, len(df)) if len(df) > 0 else 1
        model_new = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine')
        model_new.fit(X_profiles)
        
        # Build mapping with richer metadata
        mapping_data = []
        for _, row in df.iterrows():
            treatments = row.get('availableTreatments', [])
            if not isinstance(treatments, list):
                treatments = str(treatments).split(',') if treatments else []
            mapping_data.append({
                'hospital_id': str(row.get('_id', '')),
                'hospital_name': row.get('name', ''),
                'city': row.get('city', ''),
                'rating': row.get('rating', 4.5),
                'specialties': row.get('specialties', ''),
                'insurance_company': str(row.get('insuranceCompany', '') or ''),
                'cashless_available': 'Yes' if row.get('cashlessAvailable') else 'No',
                'ICU': 'Yes' if row.get('hasICU') else 'No',
                'Emergency': 'Yes' if row.get('hasEmergency') else 'No',
                'available_treatments': [t.strip() for t in treatments if t],
                'hospital_type': row.get('hospitalType', ''),
                'NABH_accredited': 'Yes' if row.get('naabhAccredited') else 'No',
                'doctor_count': int(row.get('doctorCount', 0) or 0),
                'wait_time_mins': int(row.get('waitTimeMins', 0) or 0),
                'patient_satisfaction_pct': int(row.get('patientSatisfactionPct', 0) or 0),
                'consultation_fee': row.get('consultationFee', 0),
                'Beds': int(row.get('totalBeds', 0) or 0),
            })
            
        nn_model = model_new
        vectorizer = vec_new
        hospital_mapping = mapping_data
        
        # Dump to disk for local testing fallback
        try:
            os.makedirs('ml_model', exist_ok=True)
            joblib.dump(nn_model, 'ml_model/hospital_nn_model.pkl')
            joblib.dump(vectorizer, 'ml_model/hospital_vectorizer.pkl')
            with open('ml_model/hospital_mapping.json', 'w') as f:
                json.dump(hospital_mapping, f, indent=2)
        except Exception as e:
            print("Could not write .pkl to disk (which is fine on Ephemeral Render servers):", e)
            
        print("ML models successfully initialized and loaded into memory!")
        
    except Exception as e:
        print(f"Error during startup Mongo fetch/train: {traceback.format_exc()}")

# Initialize models on cold start (Render boot)
init_models()

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if nn_model is None or vectorizer is None:
            return jsonify({'error': 'Models not initialized. Set MONGODB_URI and restart, or call /retrain.'}), 503

        data = request.json
        patient_query = data.get('symptoms', '')
        
        if not patient_query:
            return jsonify({'error': 'No symptoms provided'}), 400

        query_vector = vectorizer.transform([patient_query])
        
        # Return up to 5 results (was 3) — let the frontend decide how many to show
        n_neighbors = min(5, len(hospital_mapping)) if len(hospital_mapping) > 0 else 1
        distances, indices = nn_model.kneighbors(query_vector, n_neighbors=n_neighbors)
        
        results = []
        for i, idx in enumerate(indices[0]):
            hospital_data = hospital_mapping[idx]
            
            # Scoring: convert cosine distance to a 30-99 score
            cosine_dist = distances[0][i]
            similarity = 1 - cosine_dist  # 0 = no match, 1 = perfect
            score = max(30, min(99, int(similarity * 400)))
            
            reason = _generate_reason(patient_query, hospital_data, cosine_dist)
            
            recommended = {
                "hospitalId": hospital_data.get("hospital_id", None),
                "hospitalName": hospital_data["hospital_name"],
                "city": hospital_data["city"],
                "rating": hospital_data["rating"],
                "matchScore": score,
                "reason": reason,
                "specialties": hospital_data["specialties"],
                "cashlessAvailable": hospital_data["cashless_available"] == 'Yes',
                "insuranceCompany": hospital_data.get("insurance_company", ""),
                "hospitalType": hospital_data.get("hospital_type", ""),
                "waitTimeMins": hospital_data.get("wait_time_mins", 0),
                "patientSatisfactionPct": hospital_data.get("patient_satisfaction_pct", 0),
            }
            results.append(recommended)

        return jsonify({"hospitals": results})
        
    except Exception as e:
        print(f"Prediction error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

@app.route('/retrain', methods=['POST'])
def retrain():
    try:
        init_models()
        return jsonify({
            'status': 'success', 
            'message': 'Model retrained successfully from MongoDB.'
        })
    except Exception as e:
        print(f"Retrain error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port)
