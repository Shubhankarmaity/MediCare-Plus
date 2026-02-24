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
        # Fallback logic to get default DB mapping for mongoose
        try:
            db = client.get_default_database()
        except Exception:
            db = client['test']

        hospitals = list(db.hospitals.find({}))
        if not hospitals:
            print("No hospitals found in DB.")
            return
            
        print(f"Fetched {len(hospitals)} hospitals. Training models...")
        
        # Convert to DataFrame
        df = pd.DataFrame(hospitals)
        
        def create_hospital_profile(row):
            features = []
            features.append(str(row.get('specialties', '')))
            if row.get('hasICU'): features.append('ICU')
            if row.get('hasEmergency'): features.append('Emergency')
            if row.get('hasOT'): features.append('Operation Theatre')
            if row.get('cashlessAvailable'): features.append('Cashless')
            features.append(str(row.get('insuranceCompany', '')))
            return ' '.join(features)
            
        df['hospital_profile'] = df.apply(create_hospital_profile, axis=1)
        
        vec_new = TfidfVectorizer(stop_words='english')
        X_profiles = vec_new.fit_transform(df['hospital_profile'])
        
        n_neighbors = min(5, len(df)) if len(df) > 0 else 1
        model_new = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine')
        model_new.fit(X_profiles)
        
        mapping_data = []
        for _, row in df.iterrows():
            mapping_data.append({
                'hospital_id': str(row.get('_id', '')),
                'hospital_name': row.get('name', ''),
                'city': row.get('city', ''),
                'rating': row.get('rating', 4.5),
                'specialties': row.get('specialties', ''),
                'insurance_company': row.get('insuranceCompany', ''),
                'cashless_available': 'Yes' if row.get('cashlessAvailable') else 'No',
                'ICU': 'Yes' if row.get('hasICU') else 'No',
                'Emergency': 'Yes' if row.get('hasEmergency') else 'No'
            })
            
        nn_model = model_new
        vectorizer = vec_new
        hospital_mapping = mapping_data
        
        # Optionally dump to disk for local testing, but catching errors if ml_model dir doesn't exist
        try:
            os.makedirs('ml_model', exist_ok=True)
            joblib.dump(nn_model, 'ml_model/hospital_nn_model.pkl')
            joblib.dump(vectorizer, 'ml_model/hospital_vectorizer.pkl')
            with open('ml_model/hospital_mapping.json', 'w') as f:
                json.dump(hospital_mapping, f)
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
        
        # Ensure n_neighbors doesn't exceed the number of available hospitals
        n_neighbors = min(3, len(hospital_mapping)) if len(hospital_mapping) > 0 else 1
        distances, indices = nn_model.kneighbors(query_vector, n_neighbors=n_neighbors)
        
        results = []
        for i, idx in enumerate(indices[0]):
            hospital_data = hospital_mapping[idx]
            base_score = 100 - (distances[0][i] * 50) 
            score = max(50, min(99, int(base_score)))
            
            recommended = {
                "hospitalId": hospital_data.get("hospital_id", None),
                "hospitalName": hospital_data["hospital_name"],
                "city": hospital_data["city"],
                "rating": hospital_data["rating"],
                "matchScore": score,
                "reason": "AI matched hospital features with your symptoms",
                "specialties": hospital_data["specialties"],
                "cashlessAvailable": hospital_data["cashless_available"] == 'Yes',
                "insuranceCompany": hospital_data["insurance_company"]
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
        # Just call our init_models function which will pull fresh from Mongo
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
