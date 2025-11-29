const express = require('express');
const router = express.Router();
const {
    requestConsent,
    getConsentStatus,
    approveConsent,
    rejectConsent
} = require('../controllers/consentController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.post('/request', protect, requestConsent);
router.get('/status/:consentId', protect, getConsentStatus);
router.post('/approve/:consentId', protect, approveConsent);
router.post('/reject/:consentId', protect, rejectConsent);

module.exports = router;
