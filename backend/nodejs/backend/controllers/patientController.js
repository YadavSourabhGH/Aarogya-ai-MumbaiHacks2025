const PatientProfile = require('../models/PatientProfile');

// @desc    Get Patient Profile
// @route   GET /patient/profile
// @access  Private
const getProfile = async (req, res) => {
    try {
        const profile = await PatientProfile.findOne({ userId: req.user._id });
        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Patient Profile
// @route   PUT /patient/profile
// @access  Private
const updateProfile = async (req, res) => {
    const { demographics, lifestyle, hereditary, medicalHistory } = req.body;

    try {
        let profile = await PatientProfile.findOne({ userId: req.user._id });

        if (!profile) {
            profile = new PatientProfile({ userId: req.user._id });
        }

        if (demographics) profile.demographics = { ...profile.demographics, ...demographics };
        if (lifestyle) profile.lifestyle = { ...profile.lifestyle, ...lifestyle };
        if (hereditary) profile.hereditary = { ...profile.hereditary, ...hereditary };
        if (medicalHistory) profile.medicalHistory = { ...profile.medicalHistory, ...medicalHistory };

        await profile.save();
        res.status(200).json(profile);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
