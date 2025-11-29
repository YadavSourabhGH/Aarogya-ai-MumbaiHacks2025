const express = require('express');
const router = express.Router();
const { getPatientResults, submitReview, uploadPatientFile } = require('../controllers/doctorController');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

// Use memory storage to handle file buffer manually in controller
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/results', protect, getPatientResults);
router.post('/review', protect, submitReview);
router.post('/push-locker', protect, require('../controllers/doctorController').pushToLocker);
router.post('/upload', protect, upload.single('file'), uploadPatientFile);

module.exports = router;
