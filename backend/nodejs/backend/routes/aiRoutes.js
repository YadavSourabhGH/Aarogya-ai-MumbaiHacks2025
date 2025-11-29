const express = require('express');
const router = express.Router();
const { analyzeData, getResults, getAnalysisById } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeData);
router.get('/results/:userId', protect, getResults);
router.get('/analysis/:analysisId', protect, getAnalysisById);

module.exports = router;
