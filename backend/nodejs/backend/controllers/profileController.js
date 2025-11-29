const PatientProfile = require('../models/PatientProfile');

// @desc    Update patient profile with questionnaire data
// @route   PUT /profile/questionnaire
// @access  Private
const updateQuestionnaire = async (req, res) => {
    try {
        const { abhaId, questionnaireData } = req.body;
        console.log('updateQuestionnaire called with:', { abhaId, questionnaireData });

        if (!abhaId) {
            return res.status(400).json({ message: 'ABHA ID (patient email) is required' });
        }

        // Find user by email
        const User = require('../models/User');
        const user = await User.findOne({
            $or: [
                { email: abhaId },
                { abhaId: abhaId }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Find or create patient profile
        let profile = await PatientProfile.findOne({ userId: user._id });

        if (!profile) {
            profile = await PatientProfile.create({
                userId: user._id,
                questionnaireData: {
                    ...questionnaireData,
                    lastUpdated: new Date()
                }
            });
        } else {
            // Update questionnaire data
            profile.questionnaireData = {
                ...questionnaireData,
                lastUpdated: new Date()
            };
            await profile.save();
        }

        res.status(200).json({
            message: 'Questionnaire data saved successfully',
            profile: profile
        });

        // Trigger AI Agent to update health plan
        const aiController = require('./aiController');
        aiController.runHealthAgent(user._id);

    } catch (error) {
        console.error('Update Questionnaire Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get patient profile
// @route   GET /profile/:userId
// @access  Private
const getProfile = async (req, res) => {
    try {
        const profile = await PatientProfile.findOne({ userId: req.params.userId });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get own profile
// @route   GET /profile/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        let profile = await PatientProfile.findOne({ userId: req.user._id });

        // Create profile if doesn't exist
        if (!profile) {
            profile = await PatientProfile.create({ userId: req.user._id });
        }

        res.status(200).json(profile);
    } catch (error) {
        console.error('Get My Profile Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    updateQuestionnaire,
    getProfile,
    getMyProfile
};
