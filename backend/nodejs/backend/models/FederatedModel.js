const mongoose = require('mongoose');

const federatedSchema = new mongoose.Schema({
    round: { type: Number, default: 0 },
    globalAccuracy: { type: Number, default: 0.75 }, // Initial accuracy
    globalLoss: { type: Number, default: 0.5 },
    status: {
        type: String,
        enum: ['idle', 'training', 'aggregating'],
        default: 'idle'
    },
    participatingHospitals: [{
        id: String,
        name: String,
        status: { type: String, enum: ['idle', 'training', 'completed'], default: 'idle' },
        lastUpdate: Date
    }],
    history: [{
        round: Number,
        accuracy: Number,
        loss: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('FederatedModel', federatedSchema);
