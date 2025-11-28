import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import joblib
import shap

# Set random seed for reproducibility
np.random.seed(42)

# Number of samples
N = 1500

# Generate synthetic data
data = {
    "age": np.random.randint(20, 80, N),
    "gender": np.random.choice([0, 1], N),  # 0=male, 1=female

    # Symptoms 0/1
    "cough": np.random.choice([0,1], N),
    "weight_loss": np.random.choice([0,1], N),
    "fatigue": np.random.choice([0,1], N),
    "pain": np.random.choice([0,1], N),
    "fever": np.random.choice([0,1], N),

    # Lifestyle
    "smoker": np.random.choice([0,1], N),
    "alcohol": np.random.choice([0,1], N),

    # Labs
    "hb": np.random.normal(13, 2, N),     # Hemoglobin
    "wbc": np.random.normal(8000, 1500, N),
    "platelets": np.random.normal(250000, 40000, N),
    "esr": np.random.normal(20, 10, N),
    "neutrophils": np.random.normal(60, 10, N),
    "lymphocytes": np.random.normal(28, 8, N),
    "crp": np.random.normal(5, 3, N)
}

df = pd.DataFrame(data)

# Cancer risk rule (synthetic but medically logical)
risk_score = (
    (df["age"] > 50).astype(int) * 0.15 +
    df["smoker"] * 0.30 +
    (df["hb"] < 11).astype(int) * 0.10 +
    (df["esr"] > 30).astype(int) * 0.20 +
    df["cough"] * 0.10 +
    df["weight_loss"] * 0.10 +
    df["fatigue"] * 0.10 +
    (df["crp"] > 8).astype(int) * 0.20
)

# Convert risk score into binary cancer label (0/1)
df["cancer"] = (risk_score > 0.5).astype(int)

# Define features and target
FEATURES = [
    "age","gender","cough","weight_loss","fatigue","pain","fever",
    "smoker","alcohol","hb","wbc","platelets","esr",
    "neutrophils","lymphocytes","crp"
]

X = df[FEATURES]
y = df["cancer"]

# Split the data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train a Random Forest model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# Evaluate the model
y_prob = model.predict_proba(X_test_scaled)[:, 1]
y_pred = model.predict(X_test_scaled)

print("Model Performance:")
print(classification_report(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_prob))

# Save the model and scaler
joblib.dump(model, "models/onco_model.pkl")
joblib.dump(scaler, "models/scaler.pkl")
joblib.dump(FEATURES, "models/features.pkl")

print("\nModel saved!")

# Create SHAP explainer
print("\nCreating SHAP explainer...")

# Use a small background dataset for SHAP (important!)
background = X_train.sample(100)
background_scaled = scaler.transform(background)

# SHAP KernelExplainer for Random Forest models
explainer = shap.KernelExplainer(model.predict_proba, background_scaled)

# Save explainer & background
joblib.dump(explainer, "models/shap_explainer.pkl")
joblib.dump(background_scaled, "models/shap_background.pkl")

print("SHAP explainer saved!")

# Show feature importance
print("\nFeature Importance:")
feature_importance = pd.DataFrame({
    'feature': FEATURES,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print(feature_importance)