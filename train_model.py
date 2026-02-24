import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.neighbors import NearestNeighbors
import joblib
import json

print("Loading dataset...")
df = pd.read_csv('hospital_recommendation_dataset.csv')

# Clean the dataset - keep relevant features
# Target is predicting the best hospital based on patient needs (symptoms/specialty, insurance, ICU/Emergency needs)

print("Preprocessing features...")
# We will create a "document" for each hospital that describes its capabilities
# Then we will use NearestNeighbors to find the hospital that comes closest to the patient's "query document"

def create_hospital_profile(row):
    features = []
    features.append(str(row['specialties']))
    if row['ICU'] == 'Yes': features.append('ICU')
    if row['Emergency'] == 'Yes': features.append('Emergency')
    if row['Operation_Theatre'] == 'Yes': features.append('Operation Theatre')
    if row['cashless_available'] == 'Yes': features.append('Cashless')
    features.append(str(row['insurance_company']))
    return ' '.join(features)

df['hospital_profile'] = df.apply(create_hospital_profile, axis=1)

# TF-IDF Vectorization for textual profiles
vectorizer = TfidfVectorizer(stop_words='english')
X_profiles = vectorizer.fit_transform(df['hospital_profile'])

# Train Nearest Neighbors model
print("Training NearestNeighbors model...")
nn_model = NearestNeighbors(n_neighbors=5, metric='cosine')
nn_model.fit(X_profiles)

# Save the model and vectorizer
print("Saving models to disk...")
joblib.dump(nn_model, 'ml_model/hospital_nn_model.pkl')
joblib.dump(vectorizer, 'ml_model/hospital_vectorizer.pkl')

# Save hospital mapping data (so we know which ID corresponds to which row)
hospital_mapping = df[['hospital_id', 'hospital_name', 'city', 'rating', 'specialties', 'insurance_company', 'cashless_available', 'ICU', 'Emergency']].to_dict(orient='records')
with open('ml_model/hospital_mapping.json', 'w') as f:
    json.dump(hospital_mapping, f)

print("Training complete! Models saved in ml_model/")
