# 🏥 AAROGYA AI – AI-Powered Early Cancer Detection Platform

<div align="center">

![Aarogya AI Banner](https://img.shields.io/badge/Aarogya%20AI-Cancer%20Detection-blue?style=for-the-badge&logo=healthcare&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

**Empowering Early Detection. Preserving Privacy. Saving Lives.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Installation](#-installation--setup) • [Demo](#-screenshots) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [The Problem](#-the-problem)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [How the AI Works](#-how-the-ai-works)
- [Federated Learning](#-federated-learning)
- [DEPA Consent Flow](#-depa-consent-flow)
- [Frontend Features](#-frontend-features)
- [Output Examples](#-output-examples)
- [Installation & Setup](#-installation--setup)
- [Screenshots](#-screenshots)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🌟 Overview

**Aarogya AI** is a cutting-edge, privacy-first AI platform designed to enable **early-stage cancer detection** through multi-modal patient data analysis. Built with explainability, federated learning, and regulatory compliance at its core, Aarogya AI bridges the gap between advanced machine learning and clinical trust.

Our platform combines:
- 🧬 **Multi-modal AI** (lab results, symptoms, lifestyle, imaging)
- 🔍 **Explainable AI** (SHAP feature importance + Grad-CAM heatmaps)
- 🔒 **Privacy-Preserving Architecture** (Federated Learning + DEPA consent flows)
- 🏥 **Clinically-Inspired UI** (Risk gauges, confidence scoring, interpretable outputs)

Designed for **hospitals, clinics, research institutions**, and **health-tech innovators**, Aarogya AI aims to democratize cancer screening while respecting patient autonomy and data sovereignty.

---

## 🚨 The Problem

### Late-Stage Cancer Detection in India

- **87% of cancer cases** in India are detected at **advanced stages** (Stage III/IV), when treatment options are limited and survival rates drop significantly.
- **Early detection** can improve **5-year survival rates by up to 90%** for many cancer types.
- **Barriers to early detection:**
  - Lack of accessible screening infrastructure in rural and semi-urban areas
  - High cost of diagnostic tests (CT, MRI, PET scans)
  - Patient reluctance due to privacy concerns
  - Limited awareness and delayed symptom recognition
  - Fragmented health data across multiple providers

### The Cost of Inaction

- Over **1.3 million new cancer cases** annually in India (GLOBOCAN 2020)
- Cancer is the **2nd leading cause of death**, accounting for **9% of all deaths**
- Economic burden: estimated at **$6.5 billion annually** in treatment costs and productivity loss

---

## 💡 Our Solution

**Aarogya AI** leverages artificial intelligence to enable **non-invasive, accessible, and privacy-preserving cancer risk assessment** using readily available patient data.

### Core Value Propositions

1. **Early Detection at Scale**
   - AI-powered risk stratification using multi-modal data (lab results, symptoms, lifestyle factors, optional imaging)
   - Predictive models trained on synthetic and real-world oncology datasets
   - Confidence scoring to guide clinical decision-making

2. **Explainability & Clinical Trust**
   - **SHAP (SHapley Additive exPlanations)**: Feature-level explanations showing which factors contribute most to risk scores
   - **Grad-CAM (Gradient-weighted Class Activation Mapping)**: Visual heatmaps for imaging-based predictions (radiology trust engine)
   - Transparent probability scoring with interpretable outputs

3. **Privacy-First Architecture**
   - **Federated Learning**: Train AI models across distributed hospitals without centralizing sensitive patient data
   - **DEPA-Style Consent Flow**: Simulated compliance with India's Data Empowerment and Protection Architecture
   - **Secure Aggregation**: Global model updates without exposing individual patient records

4. **Clinically-Inspired Design**
   - Risk gauges and color-coded severity indicators
   - Feature importance visualizations for physicians
   - Exportable patient handouts for doctor-patient communication

---

## 🎯 Key Features

### 🧠 Multi-Modal AI Engine

- **Tabular Data Analysis**: Lab results (hemoglobin, WBC, tumor markers), symptoms (fatigue, weight loss), lifestyle factors (smoking, alcohol)
- **Image Analysis (Optional)**: CT/MRI/X-ray integration with Grad-CAM explainability
- **Ensemble Learning**: Combines multiple data modalities for robust predictions
- **Confidence Scoring**: Quantifies model certainty for clinical decision support

### 🔬 Explainability (XAI) Layer

| Technique | Use Case | Output |
|-----------|----------|--------|
| **SHAP** | Tabular feature importance | Bar charts showing top risk factors (e.g., "Smoking contributed +12% to risk") |
| **Grad-CAM** | Imaging heatmaps | Visual overlay highlighting suspicious regions in scans |
| **Probability Breakdown** | Risk communication | Percentage scores with confidence intervals |

### 🔐 Privacy & Compliance

- **Federated Learning Pipeline**:
  - Hospitals act as FL clients
  - Local training on-premise
  - Secure global aggregation (FedAvg algorithm)
  - No raw data leaves hospital servers
  
- **DEPA Consent Simulation**:
  - Patient-controlled data sharing
  - Mock FHIR record fetching
  - Audit logs for consent transactions
  - Compliance-ready architecture for ABDM (Ayushman Bharat Digital Mission)

### 🎨 Professional Frontend

- **Patient Dashboard**: Profile, historical screenings, risk trends
- **Doctor Dashboard**: Patient management, screening requests, FL insights
- **Screening Form**: Intuitive multi-step data entry
- **Risk Visualization**: Animated gauges, SHAP charts, Grad-CAM overlays
- **Federated Learning Dashboard**: Real-time FL training metrics, client contributions

### 🏗️ Modular Backend

- **FastAPI**: High-performance REST APIs with automatic OpenAPI docs
- **MongoDB**: Flexible schema for multi-modal patient data
- **TensorFlow/Keras**: Production-grade ML model serving
- **SHAP Integration**: Real-time explainability generation

---

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AAROGYA AI PLATFORM                              │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│   React Frontend │────────▶│  FastAPI Backend │────────▶│   MongoDB    │
│   (Vite + Tailwind)│       │  (REST APIs)     │         │  (Patient DB)│
└──────────────────┘         └──────────────────┘         └──────────────┘
         │                            │
         │                            ▼
         │                   ┌─────────────────┐
         │                   │   AI/ML Engine  │
         │                   │  (TensorFlow)   │
         │                   └─────────────────┘
         │                            │
         │                   ┌────────┴────────┐
         │                   │                 │
         │          ┌────────▼────────┐  ┌────▼──────────┐
         │          │  Tabular Model  │  │ Imaging Model │
         │          │  (XGBoost/NN)   │  │  (ResNet/CNN) │
         │          └────────┬────────┘  └────┬──────────┘
         │                   │                 │
         │          ┌────────▼────────┐  ┌────▼──────────┐
         └─────────▶│  SHAP Engine    │  │ Grad-CAM Engine│
                    │  (Feature Exp)  │  │ (Visual Exp)  │
                    └─────────────────┘  └───────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                     FEDERATED LEARNING WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

   Hospital A          Hospital B          Hospital C
   (FL Client)         (FL Client)         (FL Client)
       │                   │                   │
       │ Local Training    │ Local Training    │ Local Training
       ▼                   ▼                   ▼
   [Model Δ₁]         [Model Δ₂]         [Model Δ₃]
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                  ┌─────────────────┐
                  │  FL Aggregator  │
                  │   (FedAvg)      │
                  └─────────────────┘
                           │
                           ▼
                   [Global Model]
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   Hospital A          Hospital B          Hospital C
   (Updated Model)     (Updated Model)     (Updated Model)

┌─────────────────────────────────────────────────────────────────────────┐
│                       DEPA CONSENT FLOW                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Patient              Aarogya AI           ABDM/HIE         Hospital EHR
     │                      │                   │                  │
     │──(1) Request────────▶│                   │                  │
     │    Screening         │                   │                  │
     │                      │                   │                  │
     │◀─(2) Consent Req─────│                   │                  │
     │                      │                   │                  │
     │──(3) Grant Consent──▶│                   │                  │
     │                      │                   │                  │
     │                      │──(4) Fetch Data──▶│                  │
     │                      │   (FHIR)          │──(5) Query EHR──▶│
     │                      │                   │◀─(6) FHIR Data───│
     │                      │◀─(7) Return Data──│                  │
     │                      │                   │                  │
     │                      │──(8) AI Analysis  │                  │
     │                      │    (SHAP + Model) │                  │
     │                      │                   │                  │
     │◀─(9) Results + Exp───│                   │                  │
     │    (Risk Score +     │                   │                  │
     │     SHAP Chart)      │                   │                  │
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| **FastAPI** | High-performance REST API framework | 0.100+ |
| **TensorFlow/Keras** | Deep learning model training & inference | 2.13+ |
| **Scikit-learn** | Data preprocessing & classical ML | 1.3+ |
| **SHAP** | Explainability engine for tabular models | 0.42+ |
| **OpenCV + PyTorch** | Grad-CAM implementation for imaging | 4.8+ / 2.0+ |
| **MongoDB** | NoSQL database for patient records | 6.0+ |
| **Pydantic** | Data validation & schema enforcement | 2.0+ |
| **Uvicorn** | ASGI server for production deployment | 0.23+ |

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI component library | 18.2+ |
| **Vite** | Build tool & dev server | 4.4+ |
| **Tailwind CSS** | Utility-first styling framework | 3.3+ |
| **Recharts** | Data visualization (SHAP charts, risk gauges) | 2.8+ |
| **Axios** | HTTP client for API communication | 1.5+ |
| **React Router** | Client-side routing | 6.15+ |

### AI/ML

| Component | Details |
|-----------|---------|
| **Tabular Model** | Multi-layer perceptron (MLP) with dropout regularization |
| **Imaging Model** | ResNet-50 / EfficientNet backbone for CT/MRI analysis |
| **Explainability** | SHAP TreeExplainer (XGBoost) + DeepExplainer (Neural Nets) |
| **Grad-CAM** | Convolutional layer activation mapping for imaging |
| **Federated Learning** | Custom FedAvg implementation with secure aggregation |

### Deployment

- **Docker**: Containerized microservices
- **MongoDB Atlas**: Cloud database hosting (optional)
- **AWS/GCP/Azure**: Cloud deployment (scalable to production)
- **Local**: Standalone deployment for hospitals with on-premise requirements

---

## 🧬 How the AI Works

### 1️⃣ Data Preprocessing Pipeline

```python
# Input Features (Example)
patient_data = {
    "age": 55,
    "gender": "Male",
    "smoking_history": "Heavy",
    "hemoglobin": 11.2,
    "wbc_count": 12000,
    "tumor_marker_cea": 8.5,
    "symptoms": ["fatigue", "weight_loss", "night_sweats"],
    "family_history": "Yes"
}

# Feature Engineering
- Categorical encoding (One-Hot, Label Encoding)
- Numerical normalization (Min-Max, StandardScaler)
- Symptom vectorization (Multi-hot encoding)
- Missing value imputation (KNN, median/mode)
```

### 2️⃣ Model Training

**Training Data Sources:**
- **Synthetic Data**: Generated using domain knowledge (e.g., SMOTE, GANs)
- **Public Datasets**: SEER, TCGA, Kaggle oncology datasets
- **Federated Data**: Aggregated from hospital FL clients (privacy-preserved)

**Model Architecture (Tabular):**
```
Input Layer (n features)
    ↓
Dense (128 units, ReLU)
    ↓
Dropout (0.3)
    ↓
Dense (64 units, ReLU)
    ↓
Dropout (0.3)
    ↓
Dense (32 units, ReLU)
    ↓
Output Layer (1 unit, Sigmoid) → Cancer Probability
```

**Training Hyperparameters:**
- Optimizer: Adam (lr=0.001)
- Loss: Binary Cross-Entropy
- Metrics: AUC-ROC, Precision, Recall, F1-Score
- Epochs: 100 (with early stopping)
- Batch Size: 32

### 3️⃣ Prediction Pipeline

```python
# Step 1: Load trained model
model = load_model("onco_model.h5")

# Step 2: Preprocess patient data
features = preprocess(patient_data)

# Step 3: Generate prediction
probability = model.predict(features)[0][0]  # e.g., 0.73

# Step 4: Calculate confidence
confidence = calculate_confidence(probability, model_variance)

# Step 5: Generate SHAP explanation
shap_values = explainer.shap_values(features)
top_features = get_top_features(shap_values, n=5)

# Output
{
    "cancer_risk_probability": 0.73,
    "risk_level": "High",
    "confidence_score": 0.85,
    "top_risk_factors": [
        {"feature": "smoking_history", "contribution": 0.18},
        {"feature": "tumor_marker_cea", "contribution": 0.15},
        {"feature": "age", "contribution": 0.12}
    ]
}
```

### 4️⃣ Explainability Pipeline

**SHAP (Tabular Data):**
```python
import shap

# Initialize explainer
explainer = shap.TreeExplainer(model)  # For tree-based models
# OR
explainer = shap.DeepExplainer(model, background_data)  # For neural nets

# Generate explanations
shap_values = explainer.shap_values(patient_features)

# Visualize
shap.summary_plot(shap_values, patient_features)
shap.force_plot(explainer.expected_value, shap_values, patient_features)
```

**Grad-CAM (Imaging Data):**
```python
import cv2
import torch

# Load imaging model
model = load_imaging_model("resnet50_cancer.pth")

# Generate Grad-CAM heatmap
heatmap = generate_gradcam(model, ct_scan_image, target_layer="layer4")

# Overlay heatmap on original image
overlay = overlay_heatmap(ct_scan_image, heatmap)
```

### 5️⃣ Confidence Scoring

```python
# Bayesian Confidence Estimation
confidence = 1 - entropy(probability_distribution)

# Ensemble Confidence (if using multiple models)
predictions = [model1.predict(X), model2.predict(X), model3.predict(X)]
confidence = 1 - std(predictions) / mean(predictions)
```

---

## 🔐 Federated Learning

### Overview

Federated Learning (FL) enables **collaborative AI model training across multiple hospitals without sharing raw patient data**. Each hospital trains a local model on its own data, then shares only **model updates (weights/gradients)** with a central aggregator.

### Key Benefits

✅ **Privacy Preservation**: Patient data never leaves the hospital's infrastructure  
✅ **Regulatory Compliance**: Meets HIPAA, GDPR, and India's DPDP Act requirements  
✅ **Collaborative Learning**: Hospitals contribute to a global model without data centralization  
✅ **Improved Generalization**: Model learns from diverse patient populations across regions  

### FL Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   FL Training Cycle                         │
└─────────────────────────────────────────────────────────────┘

1. Central Server initializes global model M₀

2. Server broadcasts M₀ to all hospitals (FL clients)

3. Each hospital:
   - Trains M₀ on local patient data
   - Generates local model update ΔM_i
   - Sends ΔM_i to server (encrypted)

4. Server aggregates updates using FedAvg:
   M₁ = Σ(w_i × ΔM_i) / Σ(w_i)
   where w_i = number of samples at client i

5. Server broadcasts updated model M₁ to all clients

6. Repeat steps 3-5 for N rounds
```

### Federated Averaging (FedAvg) Algorithm

```python
# Pseudocode
def federated_averaging(client_models, client_weights):
    global_model = initialize_model()
    
    for round in range(num_rounds):
        # Step 1: Distribute global model to clients
        for client in clients:
            client.model = global_model.copy()
        
        # Step 2: Local training
        client_updates = []
        for client in clients:
            local_model = client.train(client.data, epochs=5)
            client_updates.append({
                "weights": local_model.get_weights(),
                "num_samples": len(client.data)
            })
        
        # Step 3: Aggregate updates (weighted average)
        total_samples = sum([u["num_samples"] for u in client_updates])
        aggregated_weights = []
        
        for layer_idx in range(len(global_model.layers)):
            layer_weights = [
                u["weights"][layer_idx] * (u["num_samples"] / total_samples)
                for u in client_updates
            ]
            aggregated_weights.append(sum(layer_weights))
        
        # Step 4: Update global model
        global_model.set_weights(aggregated_weights)
    
    return global_model
```

### Security Measures

1. **Secure Aggregation**: Homomorphic encryption for model updates
2. **Differential Privacy**: Add noise to gradients to prevent model inversion attacks
3. **Client Validation**: Verify authenticity of participating hospitals
4. **Audit Logs**: Track all FL transactions for compliance

### FL Dashboard Features

- **Real-Time Metrics**: Training loss, accuracy per round
- **Client Contributions**: Number of samples per hospital
- **Model Convergence**: Visualize global model performance over rounds
- **Anomaly Detection**: Identify malicious or faulty clients

---

## 🔓 DEPA Consent Flow

### What is DEPA?

**Data Empowerment and Protection Architecture (DEPA)** is India's framework for **user-centric data sharing**. It ensures:
- Patients **own and control** their health data
- Consent is **granular, auditable, and revocable**
- Data flows through **secure, standardized APIs** (FHIR)

### Aarogya AI's DEPA Implementation

```
┌─────────────────────────────────────────────────────────────┐
│                  DEPA Consent Workflow                      │
└─────────────────────────────────────────────────────────────┘

1. Patient initiates cancer screening request
   ↓
2. Aarogya AI requests consent to access:
   - Lab results (CBC, tumor markers)
   - Medical history (diagnoses, medications)
   - Imaging reports (CT, MRI)
   ↓
3. Patient reviews consent request:
   - What data will be accessed?
   - Who will access it?
   - For what purpose?
   - For how long?
   ↓
4. Patient grants consent (or denies)
   ↓
5. Aarogya AI fetches data from Health Information Exchange (HIE)
   - Uses FHIR APIs (ABDM-compliant)
   - Data is encrypted in transit (TLS 1.3)
   ↓
6. AI processes data and generates risk report
   ↓
7. Results shared with patient + treating physician
   ↓
8. Patient can revoke consent anytime
   - Triggers data deletion from Aarogya AI servers
```

### Consent Artifact Example

```json
{
  "consent_id": "CONSENT-2025-ABC123",
  "patient_id": "ABHA-1234567890",
  "requester": "Aarogya AI",
  "purpose": "Cancer Risk Assessment",
  "data_requested": [
    "Lab Results (CBC, Tumor Markers)",
    "Medical History (Past 2 years)",
    "Imaging Reports (CT Chest)"
  ],
  "data_providers": ["Hospital A", "Lab B"],
  "consent_expiry": "2025-12-31",
  "status": "GRANTED",
  "timestamp": "2025-11-29T10:30:00Z"
}
```

### FHIR Resource Integration

Aarogya AI consumes standardized FHIR resources:
- **Patient**: Demographics, ABHA ID
- **Observation**: Lab results, vital signs
- **DiagnosticReport**: Imaging reports, pathology
- **Condition**: Diagnoses, chronic illnesses
- **MedicationStatement**: Current medications

---

## 🎨 Frontend Features

### 1. Patient Dashboard

- **Profile Management**: Update demographics, medical history
- **Screening History**: View past cancer risk assessments
- **Risk Trends**: Line charts showing risk evolution over time
- **Consent Manager**: Review/revoke data sharing permissions

### 2. Doctor Dashboard

- **Patient List**: Manage screening requests, filter by risk level
- **Detailed Reports**: View SHAP explanations, Grad-CAM heatmaps
- **Referral System**: Flag high-risk patients for specialist review
- **FL Insights**: Participate in federated learning, view model performance

### 3. Screening Form

**Multi-Step Form Flow:**
1. **Personal Info**: Age, gender, family history
2. **Lifestyle Factors**: Smoking, alcohol, diet, exercise
3. **Symptoms**: Checklist (fatigue, weight loss, pain, etc.)
4. **Lab Results**: Upload or manually enter test values
5. **Imaging (Optional)**: Upload CT/MRI scans for Grad-CAM analysis
6. **Consent**: Grant permission to access additional health records

### 4. Risk Visualization

**Risk Gauge Component:**
```jsx
<RiskGauge 
  riskScore={73} 
  riskLevel="High" 
  confidence={85}
/>
```
- Color-coded: Green (Low), Yellow (Medium), Red (High)
- Animated needle transition
- Confidence percentage overlay

**SHAP Bar Chart:**
```jsx
<ShapChart 
  features={[
    {name: "Smoking", value: 0.18},
    {name: "Tumor Marker CEA", value: 0.15},
    {name: "Age", value: 0.12}
  ]}
/>
```

**Grad-CAM Overlay:**
```jsx
<GradCAMOverlay 
  originalImage="ct_scan.jpg"
  heatmapImage="gradcam_heatmap.jpg"
  opacity={0.5}
/>
```

### 5. Federated Learning Dashboard

- **Training Status**: Live updates during FL rounds
- **Client Contributions**: Bar chart showing data samples per hospital
- **Model Metrics**: Loss, accuracy, AUC-ROC per round
- **Global vs. Local Performance**: Compare centralized vs. federated models

---

## 📊 Output Examples

### 1. Prediction JSON Response

```json
{
  "patient_id": "PAT-2025-001",
  "screening_id": "SCR-20251129-XYZ",
  "timestamp": "2025-11-29T14:30:00Z",
  "risk_assessment": {
    "cancer_probability": 0.73,
    "risk_level": "High",
    "confidence_score": 0.85,
    "recommendation": "Immediate referral to oncologist. Consider CT scan and biopsy."
  },
  "explainability": {
    "shap_values": [
      {
        "feature": "smoking_history",
        "value": "Heavy (20+ years)",
        "shap_contribution": 0.18,
        "impact": "Increases risk by 18%"
      },
      {
        "feature": "tumor_marker_cea",
        "value": 8.5,
        "shap_contribution": 0.15,
        "impact": "Increases risk by 15% (elevated CEA)"
      },
      {
        "feature": "age",
        "value": 55,
        "shap_contribution": 0.12,
        "impact": "Increases risk by 12%"
      },
      {
        "feature": "weight_loss",
        "value": "Yes (10 kg in 3 months)",
        "shap_contribution": 0.10,
        "impact": "Increases risk by 10%"
      },
      {
        "feature": "family_history",
        "value": "Yes (father: lung cancer)",
        "shap_contribution": 0.08,
        "impact": "Increases risk by 8%"
      }
    ],
    "baseline_risk": 0.10
  },
  "imaging_analysis": {
    "scan_type": "CT Chest",
    "gradcam_heatmap_url": "/images/gradcam_SCR-20251129-XYZ.jpg",
    "suspicious_regions": [
      {
        "location": "Right upper lobe",
        "coordinates": [120, 85, 145, 110],
        "intensity": 0.92
      }
    ]
  }
}
```

### 2. SHAP Summary Output

```
Top 5 Risk Factors for Patient PAT-2025-001:

1. Smoking History (Heavy, 20+ years)     ████████████████████ +18%
2. Tumor Marker CEA (8.5 ng/mL)           ████████████████ +15%
3. Age (55 years)                         ███████████ +12%
4. Weight Loss (10 kg in 3 months)        █████████ +10%
5. Family History (Father: lung cancer)   ██████ +8%

Baseline Risk: 10%
Predicted Risk: 73%
Confidence: 85%

Interpretation:
- Patient's smoking history is the strongest predictor of high risk.
- Elevated CEA levels (normal: <3 ng/mL) suggest possible malignancy.
- Unexplained weight loss is a red flag symptom.

Recommendation:
Urgent referral to pulmonologist for low-dose CT scan and bronchoscopy.
```

### 3. Grad-CAM Heatmap (Description)

```
Original CT Scan: [Chest CT showing lung tissue]

Grad-CAM Overlay: [Heatmap highlights right upper lobe with red intensity]

Interpretation:
The model's attention is focused on a 2.5 cm nodule in the right upper lobe,
which correlates with radiologist's findings. High activation intensity (0.92)
suggests this region contributed most to the high-risk prediction.
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 16+ and npm/yarn
- **MongoDB**: 6.0+ (local or Atlas)
- **Git**: For cloning the repository

---

### Backend Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/YadavSourabhGH/Aarogya-ai-MumbaiHacks2025.git
cd Aarogya-ai-MumbaiHacks2025/backend/ai-ml/oncodetect-backend
```

#### 2. Create Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install fastapi uvicorn tensorflow scikit-learn shap pandas numpy pymongo python-multipart
```

**Or use requirements.txt (if available):**
```bash
pip install -r requirements.txt
```

#### 4. Configure MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Verify connection
mongosh
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `api_main.py`:
```python
client = MongoClient("mongodb+srv://<username>:<password>@cluster.mongodb.net/")
```

#### 5. Train the Model (Optional)

```bash
cd ../models
python train_model.py
```
This generates `onco_model.h5` and `scaler.pkl` in the `models/` directory.

#### 6. Run the Backend Server

```bash
cd ../oncodetect-backend
uvicorn api_main:app --reload --port 8000
```

**API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Frontend Setup

#### 1. Navigate to Frontend Directory

```bash
cd ../../oncodetect-frontend
# OR for main frontend:
cd ../../../frontend
```

#### 2. Install Dependencies

```bash
npm install
# OR
yarn install
```

#### 3. Configure API Endpoint

Edit `src/App.jsx` or create `.env`:
```env
VITE_API_URL=http://localhost:8000
```

#### 4. Run the Development Server

```bash
npm run dev
# OR
yarn dev
```

**Access Frontend:** [http://localhost:5173](http://localhost:5173)

---

### Full Stack Deployment

#### Run Both Servers Simultaneously

**Terminal 1 (Backend):**
```bash
cd backend/ai-ml/oncodetect-backend
source venv/bin/activate
uvicorn api_main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

---

### Docker Deployment (Optional)

#### Backend Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "api_main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD ["yarn", "dev", "--host"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./backend/ai-ml/oncodetect-backend
    ports:
      - "8000:8000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/aarogya
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

**Run with Docker:**
```bash
docker-compose up --build
```

---

## 🛣️ Future Roadmap

### Phase 1: Enhanced AI Capabilities (Q1 2026)
- [ ] Multi-organ cancer detection (breast, prostate, colon)
- [ ] Deep learning for histopathology images (WSI analysis)
- [ ] Integration with genomic data (mutational analysis)
- [ ] Longitudinal risk prediction (5-year survival models)

### Phase 2: Clinical Validation (Q2-Q3 2026)
- [ ] Retrospective study with 10,000+ patient records
- [ ] Prospective clinical trial in collaboration with hospitals
- [ ] Sensitivity/specificity benchmarking against radiologists
- [ ] IRB approval and clinical trial registration

### Phase 3: Regulatory Compliance (Q4 2026)
- [ ] CE Mark certification (Europe)
- [ ] USFDA 510(k) clearance (USA)
- [ ] CDSCO approval (India)
- [ ] HIPAA, GDPR, DPDP Act compliance audits

### Phase 4: Production Deployment (2027)
- [ ] Cloud infrastructure (AWS/GCP with auto-scaling)
- [ ] Multi-tenancy for hospital networks
- [ ] Mobile app (iOS/Android) for patient self-screening
- [ ] EHR integrations (Epic, Cerner, Practo)

### Phase 5: Research & Innovation (Ongoing)
- [ ] Doctor feedback loop for continuous model improvement
- [ ] Model audit logs and bias detection
- [ ] CT & MRI sequence-level analysis
- [ ] Multimodal transformers (text + imaging + genomics)

---

## 🤝 Contributing

We welcome contributions from AI researchers, clinicians, full-stack developers, and health-tech enthusiasts!

### How to Contribute

1. **Fork the Repository**
   ```bash
   git fork https://github.com/YadavSourabhGH/Aarogya-ai-MumbaiHacks2025.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Add new features, fix bugs, or improve documentation
   - Follow existing code style (PEP 8 for Python, ESLint for JavaScript)
   - Write unit tests for new functionality

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: Add multi-organ cancer detection"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes and link related issues

### Contribution Areas

- **AI/ML**: Improve model architectures, add new datasets, optimize training
- **Frontend**: Enhance UI/UX, add data visualizations, improve accessibility
- **Backend**: Optimize APIs, add new endpoints, improve security
- **Documentation**: Write tutorials, improve README, create video demos
- **Testing**: Add unit tests, integration tests, E2E tests
- **Research**: Write papers, conduct clinical studies, benchmark models

### Code of Conduct

Please read our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing. We are committed to maintaining a welcoming and inclusive community.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

✅ **Permissions:**
- Commercial use
- Modification
- Distribution
- Private use

❌ **Limitations:**
- Liability
- Warranty

📋 **Conditions:**
- License and copyright notice must be included in all copies

---

## 🙏 Acknowledgments

### Datasets & Resources

- **SEER (Surveillance, Epidemiology, and End Results)**: Cancer statistics and patient records
- **TCGA (The Cancer Genome Atlas)**: Genomic and clinical data for multiple cancer types
- **Kaggle**: Synthetic oncology datasets for model training
- **GLOBOCAN 2020**: Global cancer incidence and mortality statistics

### Technologies

- **TensorFlow Team**: For the open-source deep learning framework
- **SHAP Developers**: For making AI explainability accessible
- **FastAPI**: For the modern Python web framework
- **React Community**: For the powerful UI library

### Inspiration

- **India's ABDM (Ayushman Bharat Digital Mission)**: For the vision of unified health data infrastructure
- **Federated Learning Research**: Google's original FL paper and OpenMined community
- **Clinical Oncologists**: For domain expertise and feedback on model design

---

## 📞 Contact & Support

- **Project Lead**: Sourabh Yadav ([@YadavSourabhGH](https://github.com/YadavSourabhGH))
- **Email**: [contact@aarogya-ai.com](mailto:contact@aarogya-ai.com)
- **GitHub Issues**: [Report bugs or request features](https://github.com/YadavSourabhGH/Aarogya-ai-MumbaiHacks2025/issues)
- **Twitter**: [@AarogyaAI](https://twitter.com/AarogyaAI)
- **LinkedIn**: [Aarogya AI](https://linkedin.com/company/aarogya-ai)

---

<div align="center">

**⭐ If you find this project helpful, please star the repository! ⭐**

---

Made with ❤️ by the Aarogya AI Team

**Empowering Early Detection. Preserving Privacy. Saving Lives.**

</div>
