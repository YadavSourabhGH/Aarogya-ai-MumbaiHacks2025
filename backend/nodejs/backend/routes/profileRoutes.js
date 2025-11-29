const express = require('express');
const router = express.Router();
const { updateQuestionnaire, getProfile, getMyProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/questionnaire', protect, updateQuestionnaire);
router.get('/me', protect, getMyProfile);
router.get('/:userId', protect, getProfile);

module.exports = router;
