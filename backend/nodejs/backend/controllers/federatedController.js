const FederatedModel = require('../models/FederatedModel');

// Initialize or get the single global model instance
const getModelInstance = async () => {
    let model = await FederatedModel.findOne();
    if (!model) {
        model = await FederatedModel.create({
            round: 1,
            globalAccuracy: 0.72,
            globalLoss: 0.45,
            status: 'idle',
            participatingHospitals: [],
            history: []
        });
    }
    return model;
};

const getGlobalState = async (req, res) => {
    try {
        let model = await getModelInstance();

        // Auto-recover from stuck states (e.g. server restart during aggregation)
        if (model.status === 'aggregating' || model.status === 'training') {
            // Check if last update was more than 1 minute ago (simulation shouldn't take long)
            const lastUpdate = new Date(model.updatedAt).getTime();
            const now = new Date().getTime();
            if (now - lastUpdate > 60000) { // 1 minute timeout
                model.status = 'idle';
                model.participatingHospitals.forEach(h => h.status = 'idle');
                await model.save();
            }
        }

        res.json(model);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const registerNode = async (req, res) => {
    try {
        const { id, name } = req.body;
        const model = await getModelInstance();

        const existingNode = model.participatingHospitals.find(h => h.id === id);
        if (!existingNode) {
            model.participatingHospitals.push({ id, name, status: 'idle' });
            await model.save();
        }

        res.json(model);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const startRound = async (req, res) => {
    try {
        const model = await getModelInstance();
        model.status = 'training';
        model.participatingHospitals.forEach(h => h.status = 'training');
        await model.save();
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const submitUpdate = async (req, res) => {
    try {
        const { id } = req.body;
        const model = await getModelInstance();

        const hospital = model.participatingHospitals.find(h => h.id === id);
        if (hospital) {
            hospital.status = 'completed';
            hospital.lastUpdate = new Date();
        }

        // Check if all hospitals have completed
        const allCompleted = model.participatingHospitals.every(h => h.status === 'completed');

        if (allCompleted) {
            model.status = 'aggregating';
            await model.save();

            // Simulate aggregation delay
            setTimeout(async () => {
                await aggregateWeights();
            }, 2000);
        } else {
            await model.save();
        }

        res.json(model);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const aggregateWeights = async () => {
    const model = await getModelInstance();

    // Simulate improvement
    const improvement = (Math.random() * 0.05); // 0-5% improvement
    const newAccuracy = Math.min(0.98, model.globalAccuracy + improvement);
    const newLoss = Math.max(0.1, model.globalLoss - (improvement * 0.8));

    // Save history
    model.history.push({
        round: model.round,
        accuracy: model.globalAccuracy,
        loss: model.globalLoss
    });

    // Update state for next round
    model.round += 1;
    model.globalAccuracy = newAccuracy;
    model.globalLoss = newLoss;
    model.status = 'idle';
    model.participatingHospitals.forEach(h => h.status = 'idle');

    await model.save();
};

const resetSimulation = async (req, res) => {
    try {
        await FederatedModel.deleteMany({});
        const model = await getModelInstance();
        res.json(model);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getGlobalState,
    registerNode,
    startRound,
    submitUpdate,
    resetSimulation
};
