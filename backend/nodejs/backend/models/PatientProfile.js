const mongoose = require('mongoose');

const patientProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    demographics: {
        age: { type: Number },
        gender: { type: String, enum: ['Male', 'Female', 'Other'] },
        location: { type: String },
        bloodGroup: { type: String },
    },
    lifestyle: {
        smoking: { type: String, enum: ['Never', 'Occasional', 'Regular', 'Heavy'] },
        alcohol: { type: String, enum: ['Never', 'Occasional', 'Regular', 'Heavy'] },
        diet: { type: String, enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Other'] },
        activityLevel: { type: String, enum: ['Sedentary', 'Moderate', 'Active'] },
    },
    hereditary: {
        familyHistory: [{ type: String }], // e.g., ['Breast Cancer', 'Diabetes']
        notes: { type: String },
    },
    medicalHistory: {
        conditions: [{ type: String }],
        medications: [{ type: String }],
        allergies: [{ type: String }],
    },
    questionnaireData: {
        isSmoker: { type: Boolean, default: false },
        smokingDuration: { type: String, default: '' },
        coughingBlood: { type: Boolean, default: false },
        familyHistory: { type: Boolean, default: false },
        otherSymptoms: { type: String, default: '' },
        additionalNotes: { type: String, default: '' },
        lastUpdated: { type: Date }
    },
    healthPlan: {
        dietPlan: [{
            meal: String,
            items: [String],
            calories: Number,
            notes: String
        }],
        checkupSchedule: [{
            testName: String,
            frequency: String,
            reason: String,
            priority: { type: String, enum: ['High', 'Medium', 'Low'] }
        }],
        generatedAt: { type: Date }
    },
}, {
    timestamps: true,
});

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

module.exports = PatientProfile;
