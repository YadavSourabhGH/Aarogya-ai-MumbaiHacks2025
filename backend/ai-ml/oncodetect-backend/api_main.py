# api_main.py

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import os

# Get the absolute path to the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Load model + scaler + feature names at startup
model = joblib.load(os.path.join(PROJECT_ROOT, "models", "breast_cancer_model.pkl"))
scaler = joblib.load(os.path.join(PROJECT_ROOT, "models", "scaler.pkl"))
feature_names = joblib.load(os.path.join(PROJECT_ROOT, "models", "feature_names.pkl"))

app = FastAPI(title="Breast Cancer Risk API")

# 2. Define input schema using Pydantic
class PatientFeatures(BaseModel):
    # We'll accept a dict: { "feature_name": value }
    features: dict

@app.get("/")
def root():
    return {"message": "Breast Cancer Risk API is running"}

# 3. Prediction endpoint
@app.post("/predict")
def predict_risk(input_data: PatientFeatures):
    # input_data.features is a dict: {feature: value}
    # We need to convert it to array in correct order
    x_list = []
    for fname in feature_names:
        if fname not in input_data.features:
            return {"error": f"Missing feature: {fname}"}
        x_list.append(input_data.features[fname])

    X = np.array(x_list).reshape(1, -1)
    X_scaled = scaler.transform(X)

    # For Random Forest, we need to adjust the prediction approach
    prob = float(model.predict_proba(X_scaled)[0][1])  # Probability of class 1
    prediction = int(model.predict(X_scaled)[0])  # Predicted class

    return {
        "probability_of_class_1": prob,
        "predicted_class": prediction
    }