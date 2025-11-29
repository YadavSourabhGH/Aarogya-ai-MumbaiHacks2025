const mongoose = require('mongoose');

const hospitalProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
    },
    specialties: [{
        type: String,
    }],
    licenseNumber: {
        type: String,
    },
}, {
    timestamps: true,
});

const HospitalProfile = mongoose.model('HospitalProfile', hospitalProfileSchema);

module.exports = HospitalProfile;
