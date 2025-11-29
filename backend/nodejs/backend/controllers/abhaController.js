const User = require('../models/User');

// Mock FHIR Data Generator with Rich Historical Data
const generateMockData = (user) => {
    // Use user's real data
    const patientName = user.name || 'Unknown Patient';
    const nameParts = patientName.split(' ');
    const firstName = nameParts[0] || patientName;
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : patientName;

    const age = user.age || Math.floor(Math.random() * 30) + 40; // Use existing age or generate
    const birthYear = new Date().getFullYear() - age;

    // Calculate dates for historical data
    const now = new Date();
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    return {
        resourceType: "Bundle",
        type: "document",
        entry: [
            {
                resource: {
                    resourceType: "Patient",
                    id: user.email, // Use user's email as patient ID
                    name: [{ family: lastName, given: [firstName] }], // Split name into family and given
                    gender: user.gender || "male", // Use user's gender or default
                    birthDate: `${birthYear}-03 - 15`, // Placeholder date, could be derived from user.dob
                    age: age,
                    telecom: [{ system: "email", value: user.email }], // Use user's email for telecom
                    address: [{
                        line: ["Village Khandwa"], // Placeholder address
                        city: "Madhya Pradesh",
                        postalCode: "450001",
                        country: "India"
                    }]
                }
            },
            // CBC Reports with 6-month Hemoglobin trend (declining)
            {
                resource: {
                    resourceType: "Observation",
                    status: "final",
                    category: [{ text: "Laboratory" }],
                    code: { text: "Hemoglobin" },
                    valueQuantity: { value: 11.2, unit: "g/dL" },
                    effectiveDateTime: "2024-01-15",
                    interpretation: [{ text: "Low" }]
                }
            },
            {
                resource: {
                    resourceType: "Observation",
                    status: "final",
                    category: [{ text: "Laboratory" }],
                    code: { text: "Hemoglobin (3 months ago)" },
                    subject: { reference: `Patient/${user.email}` },
                    valueQuantity: { value: 12.1, unit: "g/dL" },
                    effectiveDateTime: threeMonthsAgo.toISOString().split('T')[0],
                    interpretation: [{ text: "Normal" }]
                }
            },
            {
                resource: {
                    resourceType: "Observation",
                    status: "final",
                    category: [{ text: "Laboratory" }],
                    code: { text: "Hemoglobin (6 months ago)" },
                    subject: { reference: `Patient/${user.email}` },
                    valueQuantity: { value: 13.8, unit: "g/dL" },
                    effectiveDateTime: sixMonthsAgo.toISOString().split('T')[0],
                    interpretation: [{ text: "Normal" }]
                }
            },
            // Neutrophil Count (High - indicates inflammation)
            {
                resource: {
                    resourceType: "Observation",
                    status: "final",
                    category: [{ text: "Laboratory" }],
                    code: { text: "Neutrophils" },
                    valueQuantity: { value: 78, unit: "%" },
                    effectiveDateTime: "2024-01-15",
                    interpretation: [{ text: "High" }],
                    referenceRange: [{ low: { value: 40 }, high: { value: 60 } }]
                }
            },
            // Chest X-Ray Report
            {
                resource: {
                    resourceType: "ImagingStudy",
                    status: "available",
                    subject: { reference: `Patient/${user.email}` },
                    started: "2023-12-20",
                    numberOfSeries: 1,
                    numberOfInstances: 1,
                    description: "Chest X-Ray PA View",
                    procedureCode: [{ text: "Chest X-Ray" }],
                    note: [{ text: "Opacity noted in upper right lung field. Recommend follow-up." }]
                }
            },
            // Past Medical History - Smoking
            {
                resource: {
                    resourceType: "Observation",
                    status: "final",
                    category: [{ text: "Social History" }],
                    code: { text: "Smoking Status" },
                    subject: { reference: `Patient/${user.email}` },
                    valueCodeableConcept: { text: "Heavy Smoker (20+ cigarettes/day for 25 years)" },
                    effectiveDateTime: "2024-01-15"
                }
            },
            // Condition - Chronic Cough
            {
                resource: {
                    resourceType: "Condition",
                    clinicalStatus: { coding: [{ code: "active" }] },
                    code: { text: "Chronic Cough with Hemoptysis" },
                    subject: { reference: `Patient/${user.email}` },
                    onsetDateTime: "2023-11-01",
                    severity: { text: "Moderate" }
                }
            }
        ],
        // Additional metadata for trend analysis
        trends: {
            hemoglobin: {
                current: 11.2,
                sixMonthsAgo: 13.8,
                change: -2.6,
                trend: "declining",
                alert: true
            }
        }
    };
};

// @desc    Connect ABHA ID
// @route   POST /abha/connect
// @access  Private
const connectAbha = async (req, res) => {
    const { abhaId } = req.body;

    if (!abhaId) {
        return res.status(400).json({ message: 'ABHA ID is required' });
    }

    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Simulate fetching data
        const mockData = generateMockData(abhaId);

        // Update user with ABHA data
        user.abhaId = abhaId;

        // Initialize array if not exists
        if (!user.connectedHospitalData) {
            user.connectedHospitalData = [];
        }

        user.connectedHospitalData.push(mockData);
        await user.save();

        res.status(200).json({
            message: 'ABHA ID connected and data fetched successfully',
            abhaId: user.abhaId,
            data: mockData
        });

    } catch (error) {
        console.error('ABHA Connection Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify ABHA ID exists (using real user emails)
// @route   GET /abha/verify/:abhaId
// @access  Private
const verifyAbhaId = async (req, res) => {
    const { abhaId } = req.params;

    // Check if ABHA ID format is valid (allow @abha format)
    const abhaRegex = /^[^\s@]+@[^\s@]+$/;
    if (!abhaRegex.test(abhaId)) {
        return res.status(400).json({
            valid: false,
            message: 'Invalid ABHA ID format. Expected format: user@abha or user@domain.com'
        });
    }

    try {
        // Check if user exists in database with this ABHA ID or email
        const user = await User.findOne({
            $or: [
                { abhaId: abhaId },
                { email: abhaId }
            ]
        });

        if (user) {
            res.status(200).json({
                valid: true,
                abhaId: abhaId,
                message: `User found: ${user.name} `,
                registered: true,
                userName: user.name
            });
        } else {
            res.status(200).json({
                valid: false,
                abhaId: abhaId,
                message: 'User not found in the system. Patient needs to register first.',
                registered: false,
                suggestion: 'Ask the patient to sign up on the platform first.'
            });
        }
    } catch (error) {
        console.error('ABHA Verification Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Real Patient Data
// @route   GET /abha/mock-data/:abhaId
// @access  Private
const getMockData = async (req, res) => {
    const { abhaId } = req.params;

    try {
        // Find user by ABHA ID or email
        const User = require('../models/User');
        const PatientProfile = require('../models/PatientProfile');

        const user = await User.findOne({
            $or: [
                { abhaId: abhaId },
                { email: abhaId }
            ]
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch patient profile
        let profile = await PatientProfile.findOne({ userId: user._id });

        // If no profile exists, create a basic one
        if (!profile) {
            profile = await PatientProfile.create({ userId: user._id });
        }

        // Build real patient data based on profile
        const patientName = user.name || 'Unknown Patient';
        const nameParts = patientName.split(' ');
        const firstName = nameParts[0] || patientName;
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : patientName;

        const age = profile.demographics?.age || 45;
        const birthYear = new Date().getFullYear() - age;

        // Use real questionnaire data if available
        const questionnaireData = profile.questionnaireData || {};
        const smokingStatus = questionnaireData.isSmoker
            ? (questionnaireData.smokingDuration || 'Smoker')
            : 'Non-Smoker';

        // Calculate dates for historical data
        const now = new Date();
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

        // Fetch user's medical documents
        const MedicalDocument = require('../models/MedicalDocument');
        const documents = await MedicalDocument.find({ userId: user._id }).sort({ createdAt: -1 });

        const medicalRecords = [];

        // Map documents to FHIR resources
        documents.forEach(doc => {
            if (doc.type === 'report' || doc.category === 'Lab Report') {
                // Try to extract hemoglobin for the trend
                const hemoglobin = doc.extractedData?.structuredData?.hemoglobin ||
                    doc.extractedData?.structuredData?.Hemoglobin ||
                    doc.extractedData?.structuredData?.hb;

                if (hemoglobin) {
                    medicalRecords.push({
                        resource: {
                            resourceType: "Observation",
                            status: "final",
                            category: [{ text: "Laboratory" }],
                            code: { text: "Hemoglobin" },
                            valueQuantity: { value: parseFloat(hemoglobin), unit: "g/dL" },
                            effectiveDateTime: doc.createdAt.toISOString().split('T')[0],
                            interpretation: [{ text: "Normal" }] // Placeholder interpretation
                        }
                    });
                }
            } else if (doc.type === 'imaging' || doc.category === 'X-Ray' || doc.category === 'Radiology') {
                medicalRecords.push({
                    resource: {
                        resourceType: "ImagingStudy",
                        status: "available",
                        subject: { reference: `Patient/${user.email}` },
                        started: doc.createdAt.toISOString().split('T')[0],
                        numberOfSeries: 1,
                        numberOfInstances: 1,
                        description: doc.filename,
                        procedureCode: [{ text: doc.category || "Imaging" }],
                        note: [{ text: doc.summary || "No summary available" }]
                    }
                });
            }
        });

        // Build FHIR-like response with real data
        const patientData = {
            resourceType: "Bundle",
            type: "document",
            entry: [
                {
                    resource: {
                        resourceType: "Patient",
                        id: user.email,
                        name: [{ family: lastName, given: [firstName] }],
                        gender: profile.demographics?.gender?.toLowerCase() || "unknown",
                        birthDate: `${birthYear}-01-01`,
                        age: age,
                        telecom: [{ system: "email", value: user.email }],
                        address: [{
                            line: [profile.demographics?.location || "Not specified"],
                            city: "India",
                            country: "India"
                        }]
                    }
                },
                ...medicalRecords,
                // Smoking Status from questionnaire
                {
                    resource: {
                        resourceType: "Observation",
                        status: "final",
                        category: [{ text: "Social History" }],
                        code: { text: "Smoking Status" },
                        subject: { reference: `Patient/${user.email}` },
                        valueCodeableConcept: { text: smokingStatus },
                        effectiveDateTime: questionnaireData.lastUpdated || new Date().toISOString()
                    }
                }
            ],
            trends: {
                hemoglobin: {
                    current: medicalRecords.find(r => r.resource.code?.text === 'Hemoglobin')?.resource.valueQuantity.value || 0,
                    sixMonthsAgo: 0,
                    change: 0,
                    trend: "stable",
                    alert: false
                }
            },
            // Include questionnaire data for pre-filling
            savedQuestionnaire: questionnaireData
        };

        res.status(200).json(patientData);
    } catch (error) {
        console.error('Get Patient Data Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user details by ABHA ID
// @route   GET /abha/user/:abhaId
// @access  Private
const getUserByAbha = async (req, res) => {
    try {
        const user = await User.findOne({ abhaId: req.params.abhaId }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    connectAbha,
    verifyAbhaId,
    getMockData,
    getUserByAbha
};
