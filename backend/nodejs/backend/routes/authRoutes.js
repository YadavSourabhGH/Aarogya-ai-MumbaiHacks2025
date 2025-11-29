const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, signup, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/signup', signup);
router.post('/login', login);
router.get('/user/me', protect, getCurrentUser);

module.exports = router;
