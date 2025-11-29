const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otpHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    resendAllowedAt: {
        type: Date,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300, // Auto-delete doc after 5 minutes (300 seconds)
    },
});

module.exports = mongoose.model('OTP', otpSchema);
