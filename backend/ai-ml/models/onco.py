import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import roc_auc_score, classification_report
from sklearn.ensemble import RandomForestClassifier
import joblib

# Generate synthetic data
np.random.seed(42)

# Number of samples
N = 1500

# Columns - expanded to 30 features to match the scaler expectation
data = {
    "age": np.random.randint(20, 80, N),
    "gender": np.random.choice([0, 1], N),  # 0=male, 1=female

    # Symptoms 0/1
    "cough": np.random.choice([0,1], N),
    "weight_loss": np.random.choice([0,1], N),
    "fatigue": np.random.choice([0,1], N),
    "pain": np.random.choice([0,1], N),
    "fever": np.random.choice([0,1], N),
    "night_sweats": np.random.choice([0,1], N),
    "loss_of_appetite": np.random.choice([0,1], N),
    "shortness_of_breath": np.random.choice([0,1], N),
    "chest_pain": np.random.choice([0,1], N),
    "headache": np.random.choice([0,1], N),
    "nausea": np.random.choice([0,1], N),
    "vomiting": np.random.choice([0,1], N),

    # Lifestyle
    "smoker": np.random.choice([0,1], N),
    "alcohol": np.random.choice([0,1], N),
    "exercise": np.random.choice([0,1], N),
    "family_history": np.random.choice([0,1], N),

    # Labs
    "hb": np.random.normal(13, 2, N),     # Hemoglobin
    "wbc": np.random.normal(8000, 1500, N),
    "platelets": np.random.normal(250000, 40000, N),
    "esr": np.random.normal(20, 10, N),
    "neutrophils": np.random.normal(60, 10, N),
    "lymphocytes": np.random.normal(28, 8, N),
    "crp": np.random.normal(5, 3, N),
    "glucose": np.random.normal(90, 15, N),
    "creatinine": np.random.normal(1.0, 0.2, N),
    "albumin": np.random.normal(4.0, 0.5, N)
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

# Expanded FEATURES list to match the 30 features
FEATURES = [
    "age","gender","cough","weight_loss","fatigue","pain","fever",
    "night_sweats","loss_of_appetite","shortness_of_breath","chest_pain",
    "headache","nausea","vomiting","smoker","alcohol","exercise","family_history",
    "hb","wbc","platelets","esr","neutrophils","lymphocytes","crp",
    "glucose","creatinine","albumin"
]

X = df[FEATURES]
y = df["cancer"]

print("Number of features:", len(FEATURES))
print("Features:", FEATURES)

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Build Random Forest model (replacing Neural Network)
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Train model
model.fit(X_train_scaled, y_train)

# Evaluate
y_prob = model.predict_proba(X_test_scaled)[:, 1]
y_pred = model.predict(X_test_scaled)

print(classification_report(y_test, y_pred))
print("AUC:", roc_auc_score(y_test, y_prob))

# Save everything
joblib.dump(model, "onco_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(FEATURES, "features.pkl")

print("Model saved!")