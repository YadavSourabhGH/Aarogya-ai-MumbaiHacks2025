# train_model.py

import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
import joblib

# 1. Load dataset
data = load_breast_cancer()
X = pd.DataFrame(data.data, columns=data.feature_names)
y = data.target  # 0 = malignant, 1 = benign

print("Shape:", X.shape, y.shape)

# 2. Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 3. Scale features (optional for tree-based models but still useful)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# 4. Build Random Forest model (replacing Keras neural network)
model = RandomForestClassifier(n_estimators=100, random_state=42)

# 5. Train model
model.fit(X_train_scaled, y_train)

# 6. Evaluate model
y_prob = model.predict_proba(X_test_scaled)[:, 1]
y_pred = model.predict(X_test_scaled)

print("Classification report:")
print(classification_report(y_test, y_pred))

auc = roc_auc_score(y_test, y_prob)
print("AUC:", auc)

# 7. Save model + scaler + feature names
joblib.dump(model, "breast_cancer_model.pkl")
joblib.dump(scaler, "scaler.pkl")
joblib.dump(list(X.columns), "feature_names.pkl")

print("Saved model, scaler, and feature names.")


