from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import joblib
import os

# Get the absolute path to the project root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(title="OncoDetect Cancer Risk API")

# Load model + preprocessing
model = joblib.load(os.path.join(PROJECT_ROOT, "models", "onco_model.pkl"))
scaler = joblib.load(os.path.join(PROJECT_ROOT, "models", "scaler.pkl"))
features = joblib.load(os.path.join(PROJECT_ROOT, "models", "features.pkl"))


# Try to load SHAP explainer for model interpretability (optional)
try:
    explainer = joblib.load(os.path.join(PROJECT_ROOT, "models", "shap_explainer.pkl"))
    SHAP_AVAILABLE = True
except Exception as e:
    print(f"SHAP explainer not available: {e}")
    explainer = None
    SHAP_AVAILABLE = False

class Patient(BaseModel):
    data: dict

@app.get("/")
def root():
    return {"message": "OncoDetect Cancer Risk API is running"}

@app.post("/predict")
def predict(patient: Patient):
    # Build feature vector
    x = []
    for f in features:
        if f not in patient.data:
            return {"error": f"Missing feature: {f}"}
        x.append(patient.data[f])

    X = np.array(x).reshape(1, -1)
    X_scaled = scaler.transform(X)

    # For Random Forest, we need to adjust the prediction approach
    prob = float(model.predict_proba(X_scaled)[0][1])
    label = 1 if prob > 0.5 else 0
    confidence = (
        "high" if prob > 0.75 else
        "medium" if prob > 0.4 else
        "low"
    )

    # Prepare base response
    response = {
        "cancer_risk": prob,
        "prediction": label,
        "confidence": confidence
    }

    # Add explainability if SHAP is available
    if SHAP_AVAILABLE and explainer is not None:
        try:
            # Generate SHAP explanations
            # For KernelExplainer with predict_proba, we need to be careful about the function signature
            shap_values = explainer.shap_values(X_scaled)
            
            # For binary classification, shap_values is a list with two elements
            # We want the SHAP values for the positive class (class 1)
            if isinstance(shap_values, list):
                shap_values = shap_values[1]
            
            # Extract SHAP values for this prediction
            # Handle both array and scalar cases
            if hasattr(shap_values, '__len__') and len(shap_values) > 0:
                shap_vals = shap_values[0] if len(shap_values) > 0 else shap_values
            else:
                shap_vals = shap_values
            
            # Convert to array if it's not already
            if not isinstance(shap_vals, np.ndarray):
                shap_vals = np.array(shap_vals)
            
            # Ensure it's a 1D array
            if shap_vals.ndim > 1:
                shap_vals = shap_vals.flatten()
            
            # Create feature importance list
            feature_importance = []
            for i, feature in enumerate(features):
                # Make sure we don't go out of bounds
                if i < len(shap_vals):
                    feature_importance.append({
                        "feature": feature,
                        "impact": float(shap_vals[i])
                    })
            
            # Sort by absolute impact if we have values
            if feature_importance:
                feature_importance.sort(key=lambda x: abs(x["impact"]), reverse=True)
                
                # Get top 3 features
                top_features = feature_importance[:3]
                
                response["explainability"] = {
                    "all_features": feature_importance,
                    "top_features": top_features
                }
        except Exception as e:
            print(f"Error generating SHAP explanations: {e}")
            # Continue without explainability if there's an error
    
    return response


