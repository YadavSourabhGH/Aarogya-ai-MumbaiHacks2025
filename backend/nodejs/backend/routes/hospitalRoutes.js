const express = require('express');
const router = express.Router();
const { createPatientRecord, searchPatients } = require('../controllers/hospitalController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check if user is hospital
const hospitalOnly = (req, res, next) => {
    if (req.user && req.user.role === 'hospital') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a hospital' });
    }
};

router.post('/patient-record', protect, hospitalOnly, createPatientRecord);
router.get('/patients', protect, hospitalOnly, searchPatients);

module.exports = router;
