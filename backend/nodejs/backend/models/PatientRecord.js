const mongoose = require('mongoose');

const patientRecordSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    textContent: {
        type: String,
    },
    summary: {
        type: String,
    },
    structuredLabData: {
        type: Object,
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileRecord',
    }],
    sourceFileIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FileRecord',
    }],
    source: {
        type: String,
        enum: ['upload', 'hospital'],
        required: true,
    },
}, {
    timestamps: true,
});

const PatientRecord = mongoose.model('PatientRecord', patientRecordSchema);

module.exports = PatientRecord;
