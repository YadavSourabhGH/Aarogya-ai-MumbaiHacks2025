const Analysis = require('../models/Analysis');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all AI results for doctor review
// @route   GET /doctor/results
// @access  Private (Doctor only - for MVP we might just check role or allow all for demo)
const getPatientResults = async (req, res) => {
    try {
        // In a real app, we would filter by doctor's assigned patients
        const results = await Analysis.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Submit doctor review
// @route   POST /doctor/review
// @access  Private
const submitReview = async (req, res) => {
    const { resultId, decision, notes } = req.body;

    try {
        const analysis = await Analysis.findById(resultId);

        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        // Update doctorReview object
        analysis.doctorReview = {
            reviewedBy: req.user._id,
            status: decision === 'approved' ? 'approved' : 'flagged',
            notes: notes || '',
            timestamp: new Date()
        };

        await analysis.save();

        // Trigger AI Agent to update health plan
        const aiController = require('./aiController');
        aiController.runHealthAgent(analysis.userId);

        res.status(200).json({ message: 'Review submitted successfully', analysis });
    } catch (error) {
        console.error('Doctor review error:', error);
        res.status(500).json({ message: error.message });
    }
};



// @desc    Push analysis report to ABHA Locker
// @route   POST /doctor/push-locker
// @access  Private
const pushToLocker = async (req, res) => {
    const { analysisId, abhaId } = req.body;

    try {
        const analysis = await Analysis.findById(analysisId);
        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        // Find patient user
        const patient = await User.findOne({
            $or: [
                { email: abhaId },
                { abhaId: abhaId }
            ]
        });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const MedicalDocument = require('../models/MedicalDocument');

        // Create MedicalDocument from Analysis
        const doc = await MedicalDocument.create({
            userId: patient._id,
            uploadedBy: req.user._id, // Doctor
            type: 'report',
            category: 'Cancer Screening Report',
            filename: `CureSight_Report_${new Date().toISOString().split('T')[0]}.pdf`, // Simulated filename
            fileUrl: new mongoose.Types.ObjectId(), // Placeholder GridFS ID as we don't have a real file yet
            mimeType: 'application/pdf',
            extractedData: {
                text: analysis.explanation,
                structuredData: {
                    riskScore: analysis.overallRiskScore,
                    cancerStage: analysis.cancerStage,
                    confidence: analysis.confidence
                }
            },
            summary: `CureSight Analysis: ${analysis.cancerStage} (Risk: ${analysis.overallRiskScore}%) - ${analysis.explanation}`,
            analysisStatus: 'processed'
        });

        res.status(200).json({ message: 'Pushed to locker successfully', document: doc });

    } catch (error) {
        console.error('Push to locker error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Initialize GridFS
let gridfsBucket;
const conn = mongoose.connection;

const initGridFS = () => {
    if (!gridfsBucket && conn.db) {
        gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
            bucketName: 'uploads'
        });
        console.log('GridFS Initialized in doctorController');
    }
};

if (conn.readyState === 1) {
    initGridFS();
} else {
    conn.once('open', initGridFS);
}

// @desc    Upload file for patient (by doctor)
// @route   POST /doctor/upload
// @access  Private
const uploadPatientFile = async (req, res) => {
    if (!gridfsBucket) initGridFS(); // Ensure initialized
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const { abhaId } = req.body;
    if (!abhaId) {
        return res.status(400).json({ message: 'ABHA ID is required' });
    }

    try {
        // Find patient
        const patient = await User.findOne({
            $or: [
                { email: abhaId },
                { abhaId: abhaId }
            ]
        });
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

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
        // Note: We are importing ocrService dynamically to avoid circular dependencies if any
        const ocrService = require('../services/ocrService');
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

        const MedicalDocument = require('../models/MedicalDocument');

        // Create MedicalDocument linked to patient
        const doc = await MedicalDocument.create({
            userId: patient._id, // Linked to patient
            uploadedBy: req.user._id, // Uploaded by doctor
            type: req.body.type || 'report',
            category: req.body.category || 'General',
            filename: filename,
            fileUrl: fileId,
            mimeType: req.file.mimetype,
            extractedData: { text: textContent, structuredData: structuredLabData },
            summary: summary,
            analysisStatus: 'processed'
        });

        res.status(201).json({
            message: 'File uploaded for patient successfully',
            document: doc,
        });

        // Trigger AI Agent to update health plan
        const aiController = require('./aiController');
        aiController.runHealthAgent(patient._id);
    } catch (error) {
        console.error("Doctor Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPatientResults,
    submitReview,
    pushToLocker,
    uploadPatientFile
};
