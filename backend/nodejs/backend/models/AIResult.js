const mongoose = require('mongoose');

const aiResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    patientRecordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PatientRecord',
    },
    riskScore: {
        type: Number, // 0-100
    },
    cancerStage: {
        type: String, // 0-4
    },
    organRisk: {
        lung: Number,
        breast: Number,
        oral: Number,
        colorectal: Number,
    },
    confidence: {
        type: Number,
    },
    explanation: {
        type: String,
    },
    nextSteps: {
        type: String,
    },
    rawGeminiResponse: {
        type: Object,
    },
    doctorReviewed: {
        type: Boolean,
        default: false,
    },
    doctorDecision: {
        type: String,
        enum: ['approved', 'override', 'pending'],
        default: 'pending',
    },
    doctorNotes: {
        type: String,
    },
}, {
    timestamps: true,
});

const AIResult = mongoose.model('AIResult', aiResultSchema);

module.exports = AIResult;
