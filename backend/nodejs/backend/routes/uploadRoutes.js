const express = require('express');
const router = express.Router();
const multer = require('multer');
// const { GridFsStorage } = require('multer-gridfs-storage'); // Removed due to crash issues
const { uploadFile, getFile, getUserFiles, getFileAnalysis } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');
const dotenv = require('dotenv');

dotenv.config();

// Use memory storage to handle file buffer manually in controller
// This avoids the 'Cannot read properties of undefined (reading '_id')' crash in multer-gridfs-storage
const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/file/:fileId', protect, getFile);
router.get('/analysis/:fileId', protect, getFileAnalysis);
router.get('/user/:userId', protect, getUserFiles);

module.exports = router;
