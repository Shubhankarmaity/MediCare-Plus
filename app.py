from flask import Flask, request, jsonify
import joblib
import json
import traceback

app = Flask(__name__)

print("Loading ML models...")
try:
    nn_model = joblib.load('ml_model/hospital_nn_model.pkl')
    vectorizer = joblib.load('ml_model/hospital_vectorizer.pkl')
    
    with open('ml_model/hospital_mapping.json', 'r') as f:
        hospital_mapping = json.load(f)
        
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models. Did you run train_model.py first? Error: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        patient_query = data.get('symptoms', '')
        
        if not patient_query:
            return jsonify({'error': 'No symptoms provided'}), 400

        # Vectorize the patient's query
        query_vector = vectorizer.transform([patient_query])
        
        # Find the top 3 nearest hospitals
        distances, indices = nn_model.kneighbors(query_vector, n_neighbors=3)
        
        results = []
        for i, idx in enumerate(indices[0]):
            hospital_data = hospital_mapping[idx]
            # Convert the distance into a "match confidence score" (0 to 100%)
            # The closer the distance (closer to 0), the higher the score
            base_score = 100 - (distances[0][i] * 50) 
            score = max(50, min(99, int(base_score)))
            
            # Format the data exactly as the Node.js backend expects
            recommended = {
                "hospitalId": None,  # Will be mapped in Node
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
        data = request.json
        hospitals_list = data.get('hospitals', [])
        
        if not hospitals_list:
            return jsonify({'error': 'No hospital data provided for retraining'}), 400

        print(f"Received {len(hospitals_list)} hospitals for dynamic retraining...")
        
        # Convert JSON list to Pandas DataFrame
        import pandas as pd
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.neighbors import NearestNeighbors
        
        df = pd.DataFrame(hospitals_list)
        
        # Our Python ML model expects certain column names from the CSV logic:
        # We'll map the incoming JSON keys to what the vectorizer used safely
        
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
        
        print("Transforming text features...")
        vectorizer_new = TfidfVectorizer(stop_words='english')
        X_profiles = vectorizer_new.fit_transform(df['hospital_profile'])
        
        print("Training NearestNeighbors model...")
        # Fallback to len(df) if we have fewer hospitals than neighbors
        n_neighbors = min(5, len(df)) if len(df) > 0 else 1
        nn_model_new = NearestNeighbors(n_neighbors=n_neighbors, metric='cosine')
        nn_model_new.fit(X_profiles)
        
        print("Saving new models to disk...")
        joblib.dump(nn_model_new, 'ml_model/hospital_nn_model.pkl')
        joblib.dump(vectorizer_new, 'ml_model/hospital_vectorizer.pkl')
        
        # Build the exact mapping structure the /predict endpoint expects
        # hospital_name, city, rating, specialties, insurance_company, cashless_available
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
            
        with open('ml_model/hospital_mapping.json', 'w') as f:
            json.dump(mapping_data, f)
            
        # VERY IMPORTANT: Reload models into memory so the live server uses them!
        global nn_model, vectorizer, hospital_mapping
        nn_model = nn_model_new
        vectorizer = vectorizer_new
        hospital_mapping = mapping_data
        
        return jsonify({
            'status': 'success', 
            'message': f'Model retrained successfully with {len(df)} hospitals.'
        })

    except Exception as e:
        print(f"Retrain error: {traceback.format_exc()}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the server on port 5001 to not conflict with Node backend
    app.run(host='0.0.0.0', port=5001)
