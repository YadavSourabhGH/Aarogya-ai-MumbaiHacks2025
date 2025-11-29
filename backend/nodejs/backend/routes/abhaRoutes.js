const express = require('express');
const router = express.Router();
const { connectAbha, verifyAbhaId, getMockData, getUserByAbha } = require('../controllers/abhaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/connect', protect, connectAbha);
router.get('/verify/:abhaId', protect, verifyAbhaId);
router.get('/user/:abhaId', protect, getUserByAbha);
router.get('/mock-data/:abhaId', protect, getMockData);

module.exports = router;
