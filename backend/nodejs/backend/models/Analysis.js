const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    consentId: { // Track DEPA consent
        type: String,
    },
    documentIds: [{ // Which documents were used for this analysis
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MedicalDocument',
    }],
    overallRiskScore: {
        type: Number, // 0-100
        required: true,
    },
    confidence: { // AI confidence score
        type: Number, // 0-100
        default: 85,
    },
    organRisks: {
        lung: { score: Number, explanation: String },
        breast: { score: Number, explanation: String },
        oral: { score: Number, explanation: String },
        colorectal: { score: Number, explanation: String },
        prostate: { score: Number, explanation: String },
        skin: { score: Number, explanation: String },
        // Add more as needed
    },
    cancerStage: {
        type: String,
    },
    shapExplanation: { // Detailed "Why"
        type: String,
    },
    shapFactors: [{ // SHAP-style risk factors
        name: String,
        impact: Number, // percentage impact
        direction: { type: String, enum: ['increase', 'decrease'] },
        value: String // actual value (e.g., "20 cigarettes/day")
    }],
    gradcamHeatmap: { // GradCAM coordinates for X-ray overlay
        coordinates: [{
            x: Number, // x position (0-1 normalized)
            y: Number, // y position (0-1 normalized)
            intensity: Number // heat intensity (0-1)
        }],
        suspiciousRegion: {
            description: String,
            location: String // e.g., "upper right lung"
        }
    },
    questionnaire: { // Real-time input from doctor
        isSmoker: Boolean,
        smokingDuration: String,
        coughingBlood: Boolean,
        familyHistory: Boolean,
        otherSymptoms: String,
        additionalNotes: String
    },
    recommendations: [{
        type: String,
    }],
    nextSteps: {
        type: String, // "Consult Oncologist", "Biopsy", etc.
    },
    clinicReferrals: [{ // Mock referrals
        name: String,
        specialty: String,
        location: String,
        contact: String,
        appointmentDate: Date
    }],
    doctorReview: {
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'approved', 'flagged'] },
        notes: String,
        timestamp: Date,
    },
}, {
    timestamps: true,
});

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis;

