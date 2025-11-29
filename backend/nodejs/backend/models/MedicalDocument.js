const mongoose = require('mongoose');

const medicalDocumentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    uploadedBy: { // Could be the patient or a hospital
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['imaging', 'report', 'prescription', 'other'],
        required: true,
    },
    category: { // More specific: 'X-Ray', 'MRI', 'Blood Test', etc.
        type: String,
    },
    filename: {
        type: String,
        required: true,
    },
    fileUrl: { // GridFS ID
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    mimeType: {
        type: String,
    },
    extractedData: { // JSON from OCR/Gemini
        type: Object,
    },
    summary: { // AI Summary
        type: String,
    },
    analysisStatus: {
        type: String,
        enum: ['pending', 'processed', 'failed'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

const MedicalDocument = mongoose.model('MedicalDocument', medicalDocumentSchema);

module.exports = MedicalDocument;
