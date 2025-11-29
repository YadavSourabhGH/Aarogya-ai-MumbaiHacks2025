const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const MedicalDocument = require('../models/MedicalDocument');
const mongoose = require('mongoose');

// @desc    Create/Update Patient Record (by Hospital)
// @route   POST /hospital/patient-record
// @access  Private (Hospital Only)
const createPatientRecord = async (req, res) => {
    const { patientEmail, patientName, documentType, category, notes } = req.body;
    // Note: File upload should be handled by middleware and passed here, or this is just metadata
    // For simplicity, let's assume file upload happens via the standard upload route but tagged as 'hospital' source
    // OR we can handle it here if we use multer middleware on this route.

    // Let's assume this route is for METADATA creation or linking, 
    // and the actual file upload happens via a unified upload endpoint that returns a fileId.
    // OR better: This route handles everything if we use multer here.

    // Let's stick to the pattern: Upload File -> Get ID -> Create Record.
    // So this endpoint receives a fileId.

    const { fileId, filename, mimeType } = req.body;

    try {
        // 1. Find or Create Patient User
        let patient = await User.findOne({ email: patientEmail });

        if (!patient) {
            // Create a "shadow" user or real user?
            // For now, let's require patient to exist or create a placeholder
            // Generating a random password for placeholder
            const tempPassword = Math.random().toString(36).slice(-8);
            patient = await User.create({
                name: patientName,
                email: patientEmail,
                password: tempPassword,
                role: 'patient'
            });
            await PatientProfile.create({ userId: patient._id });
        }

        // 2. Create Medical Document
        const doc = await MedicalDocument.create({
            userId: patient._id,
            uploadedBy: req.user._id, // Hospital User ID
            type: documentType || 'report',
            category: category || 'General',
            filename: filename || `Hospital_Upload_${Date.now()}`,
            fileUrl: fileId, // GridFS ID
            mimeType: mimeType,
            summary: notes, // Initial notes from hospital
            source: 'hospital'
        });

        res.status(201).json({
            message: 'Patient record created successfully',
            patientId: patient._id,
            document: doc
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Search Patients
// @route   GET /hospital/patients?query=...
// @access  Private (Hospital Only)
const searchPatients = async (req, res) => {
    const { query } = req.query;
    try {
        const patients = await User.find({
            role: 'patient',
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name email');

        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createPatientRecord,
    searchPatients
};
