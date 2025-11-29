const mongoose = require('mongoose');
const MedicalDocument = require('../models/MedicalDocument');
const ocrService = require('../services/ocrService');

let gfs, gridfsBucket;

const conn = mongoose.connection;

const initGridFS = () => {
    if (!gridfsBucket && conn.db) {
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });
        gfs = gridfsBucket;
        console.log('GridFS Initialized in uploadController');
    }
};

if (conn.readyState === 1) {
    initGridFS();
} else {
    conn.once('open', initGridFS);
}

// @desc    Upload a file
// @route   POST /records/upload
// @access  Private
const uploadFile = async (req, res) => {
    if (!gridfsBucket) initGridFS(); // Ensure initialized

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const uploadStream = gridfsBucket.openUploadStream(filename, {
            contentType: req.file.mimetype,
        });

        const fileId = await new Promise((resolve, reject) => {
            uploadStream.on('error', (error) => reject(error));
            uploadStream.on('finish', () => resolve(uploadStream.id));
            uploadStream.end(req.file.buffer);
        });

        // Trigger async processing (OCR/Text Extraction)
        let textContent = '';
        let structuredLabData = {};
        let summary = '';

        try {
            const extractionResult = await ocrService.extractText(fileId, req.file.mimetype, gridfsBucket);
            textContent = extractionResult.text;
            structuredLabData = extractionResult.structuredData;
            summary = extractionResult.summary;
        } catch (err) {
            console.error("OCR Failed:", err);
        }

        // Create MedicalDocument
        const doc = await MedicalDocument.create({
            userId: req.user._id,
            uploadedBy: req.user._id,
            type: req.body.type || 'report', // 'imaging' or 'report'
            category: req.body.category || 'General',
            filename: filename,
            fileUrl: fileId,
            mimeType: req.file.mimetype,
            extractedData: { text: textContent, structuredData: structuredLabData },
            summary: summary,
            analysisStatus: 'processed'
        });

        res.status(201).json({
            message: 'File uploaded and processed successfully',
            document: doc,
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get file by ID (stream)
// @route   GET /records/file/:fileId
// @access  Private
const getFile = async (req, res) => {
    if (!gridfsBucket) initGridFS(); // Ensure initialized

    try {
        console.log(`Getting file: ${req.params.fileId}`);
        const fileId = new mongoose.Types.ObjectId(req.params.fileId);

        const files = await gridfsBucket.find({ _id: fileId }).toArray();
        console.log(`Files found: ${files.length}`);

        if (!files || files.length === 0) {
            console.log('File not found in GridFS');
            return res.status(404).json({ message: 'File not found' });
        }

        const file = files[0];
        console.log(`Serving file: ${file.filename}, Content-Type: ${file.contentType}`);
        res.set('Content-Type', file.contentType);
        const downloadStream = gridfsBucket.openDownloadStream(fileId);
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Get File Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analysis/summary for a specific file
// @route   GET /records/analysis/:fileId
// @access  Private
const getFileAnalysis = async (req, res) => {
    try {
        // Find the MedicalDocument by its fileUrl (GridFS ID)
        const document = await MedicalDocument.findOne({
            fileUrl: req.params.fileId
        });

        if (!document) {
            return res.status(404).json({ message: 'Analysis not found for this file' });
        }

        res.status(200).json({
            summary: document.summary,
            structuredData: document.extractedData?.structuredData || {},
            text: document.extractedData?.text || ''
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user files
// @route   GET /records/user/:userId
// @access  Private
const getUserFiles = async (req, res) => {
    try {
        // Allow fetching by param ID if provided, otherwise default to logged-in user
        const targetUserId = req.params.userId || req.user._id;
        const documents = await MedicalDocument.find({ userId: targetUserId }).sort({ createdAt: -1 });

        // Transform to match frontend expectations (temporary compatibility)
        const files = documents.map(doc => ({
            _id: doc._id,
            filename: doc.filename,
            fileType: doc.mimeType,
            gridFsId: doc.fileUrl,
            createdAt: doc.createdAt,
            type: doc.type,
            category: doc.category
        }));

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadFile,
    getFile,
    getFileAnalysis,
    getUserFiles,
};
