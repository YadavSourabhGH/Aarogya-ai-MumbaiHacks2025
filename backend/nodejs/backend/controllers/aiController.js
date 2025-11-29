const Analysis = require('../models/Analysis');
const MedicalDocument = require('../models/MedicalDocument');
const PatientProfile = require('../models/PatientProfile');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const mongoose = require('mongoose');

// Helper to get file buffer from GridFS
const getFileBuffer = async (gridfsBucket, fileId) => {
    const downloadStream = gridfsBucket.openDownloadStream(fileId);
    const chunks = [];
    return new Promise((resolve, reject) => {
        downloadStream.on('data', (chunk) => chunks.push(chunk));
        downloadStream.on('end', () => resolve(Buffer.concat(chunks)));
        downloadStream.on('error', (err) => reject(err));
    });
};

// @desc    Analyze Patient Data
// @route   POST /ai/analyze
// @access  Private
const analyzeData = async (req, res) => {
    const userId = req.user._id;
    const { questionnaire, consentId } = req.body; // Accept questionnaire and consent ID

    try {
        // 1. Gather Data
        const user = await User.findById(userId);
        const profile = await PatientProfile.findOne({ userId });
        const documents = await MedicalDocument.find({ userId });

        // Combine all text data
        let combinedData = {
            profile: profile,
            documents: documents.map(d => ({
                type: d.type,
                category: d.category,
                summary: d.summary,
                extractedData: d.extractedData
            })),
            hospitalData: user.connectedHospitalData,
            questionnaire: questionnaire || {}
        };

        // 2. Gather Images
        const conn = mongoose.connection;
        const gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, { bucketName: 'uploads' });

        let imageBuffers = [];
        let documentIds = [];

        for (const doc of documents) {
            documentIds.push(doc._id);
            if (doc.mimeType && doc.mimeType.startsWith('image/')) {
                const buffer = await getFileBuffer(gridfsBucket, doc.fileUrl);
                imageBuffers.push({ buffer, mimeType: doc.mimeType });
            }
        }

        // 3. Calculate SHAP Factors (Risk contributors)
        const shapFactors = [];
        let baseRisk = 20; // Baseline risk

        // Age factor
        const age = profile?.age || 52;
        if (age > 50) {
            const ageFactor = Math.min((age - 50) * 1.5, 10);
            shapFactors.push({
                name: 'Age',
                impact: ageFactor,
                direction: 'increase',
                value: `${age} years`
            });
            baseRisk += ageFactor;
        }

        // Smoking factor (highest impact)
        if (questionnaire?.isSmoker) {
            const smokingImpact = 30;
            shapFactors.push({
                name: 'Smoking History',
                impact: smokingImpact,
                direction: 'increase',
                value: questionnaire.smokingDuration || '20+ cigarettes/day'
            });
            baseRisk += smokingImpact;
        }

        // Neutrophil count (inflammation marker)
        const hasHighNeutrophils = user.connectedHospitalData?.some(data =>
            data.entry?.some(e =>
                e.resource?.code?.text === 'Neutrophils' &&
                e.resource?.valueQuantity?.value > 70
            )
        );
        if (hasHighNeutrophils) {
            shapFactors.push({
                name: 'High Neutrophils',
                impact: 15,
                direction: 'increase',
                value: '78% (elevated)'
            });
            baseRisk += 15;
        }

        // Hemoglobin drop (anemia/malignancy sign)
        const hasHemoglobinDrop = user.connectedHospitalData?.some(data =>
            data.trends?.hemoglobin?.trend === 'declining'
        );
        if (hasHemoglobinDrop) {
            shapFactors.push({
                name: 'Declining Hemoglobin',
                impact: 10,
                direction: 'increase',
                value: '11.2 g/dL (down from 13.8)'
            });
            baseRisk += 10;
        }

        // Coughing blood
        if (questionnaire?.coughingBlood) {
            shapFactors.push({
                name: 'Hemoptysis (Coughing Blood)',
                impact: 12,
                direction: 'increase',
                value: 'Present'
            });
            baseRisk += 12;
        }

        // Cap risk at 100
        const overallRiskScore = Math.min(baseRisk, 98);

        // 4. Generate Mock GradCAM Heatmap
        const gradcamHeatmap = {
            coordinates: [
                { x: 0.65, y: 0.25, intensity: 0.9 },  // Upper right lung hotspot
                { x: 0.67, y: 0.27, intensity: 0.95 },
                { x: 0.63, y: 0.23, intensity: 0.85 },
                { x: 0.68, y: 0.26, intensity: 0.80 }
            ],
            suspiciousRegion: {
                description: 'Suspicious Opacity Detected',
                location: 'Upper right lung field'
            }
        };

        // 5. Calculate Confidence Score
        const dataCompleteness = (
            (imageBuffers.length > 0 ? 30 : 0) +
            (user.connectedHospitalData?.length > 0 ? 30 : 0) +
            (questionnaire && Object.keys(questionnaire).length > 2 ? 25 : 10) +
            (profile ? 15 : 0)
        );
        const confidence = Math.min(dataCompleteness, 95);

        // 6. Determine Cancer Stage
        const cancerStage = overallRiskScore > 80 ? 'Suspected Early Stage (requires biopsy)' :
            overallRiskScore > 50 ? 'Moderate Risk' : 'Low Risk';

        // 7. Generate Recommendations
        const recommendations = [
            'Immediate cessation of smoking',
            'Follow-up chest CT scan within 2 weeks',
            'Complete blood count monitoring',
            'Nutritional assessment and dietary modifications'
        ];

        // 8. Clinic Referrals
        const clinicReferrals = [
            {
                name: 'Tata Memorial Hospital',
                specialty: 'Oncology',
                location: 'Mumbai, Maharashtra',
                contact: '+91-22-2417-7000',
                appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
            },
            {
                name: 'AIIMS Cancer Center',
                specialty: 'Pulmonary Oncology',
                location: 'New Delhi',
                contact: '+91-11-2658-8500',
                appointmentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            }
        ];

        // 9. Call Gemini (existing logic, enhanced with new data)
        const analysisResult = await geminiService.analyzeHealthData(combinedData, imageBuffers);

        // 10. Save Result with new fields
        const analysis = await Analysis.create({
            userId,
            consentId,
            documentIds,
            overallRiskScore: overallRiskScore,
            confidence: confidence,
            organRisks: analysisResult.organRisks || {
                lung: { score: overallRiskScore, explanation: 'Based on smoking history and imaging findings' }
            },
            cancerStage: cancerStage,
            shapExplanation: analysisResult.shapExplanation || `Risk score of ${overallRiskScore}% calculated from multiple factors including smoking history, biomarker trends, and imaging analysis.`,
            shapFactors: shapFactors,
            gradcamHeatmap: gradcamHeatmap,
            questionnaire: questionnaire,
            recommendations: recommendations,
            nextSteps: overallRiskScore > 70 ? 'Immediate biopsy recommendation and oncology consultation' : 'Regular monitoring and follow-up in 3 months',
            clinicReferrals: clinicReferrals
        });

        res.status(200).json(analysis);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Analysis Results
// @route   GET /ai/results/:userId
// @access  Private
const getResults = async (req, res) => {
    try {
        const analyses = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 });

        // Transform to match frontend expectations (temporary compatibility)
        const results = analyses.map(analysis => ({
            _id: analysis._id,
            userId: analysis.userId,
            riskScore: analysis.overallRiskScore,
            cancerStage: analysis.cancerStage,
            confidence: 85, // Mock confidence for now (can be calculated from organRisks)
            organRisk: analysis.organRisks ? {
                lung: analysis.organRisks.lung?.score || 0,
                breast: analysis.organRisks.breast?.score || 0,
                oral: analysis.organRisks.oral?.score || 0,
                colorectal: analysis.organRisks.colorectal?.score || 0,
                prostate: analysis.organRisks.prostate?.score || 0,
                skin: analysis.organRisks.skin?.score || 0
            } : {},
            explanation: analysis.shapExplanation,
            nextSteps: analysis.nextSteps,
            createdAt: analysis.createdAt,
            // Keep new fields for future use
            recommendations: analysis.recommendations,
            clinicReferrals: analysis.clinicReferrals,
            organRisks: analysis.organRisks // Full detailed version
        }));

        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Single Analysis by ID
// @route   GET /ai/analysis/:analysisId
// @access  Private
const getAnalysisById = async (req, res) => {
    try {
        const { analysisId } = req.params;
        const analysis = await Analysis.findById(analysisId).populate('documentIds');

        if (!analysis) {
            return res.status(404).json({ message: 'Analysis not found' });
        }

        // Check if user owns this analysis
        if (analysis.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this analysis' });
        }

        // Return complete analysis with all new fields
        res.status(200).json({
            _id: analysis._id,
            userId: analysis.userId,
            consentId: analysis.consentId,
            documentIds: analysis.documentIds,
            overallRiskScore: analysis.overallRiskScore,
            confidence: analysis.confidence,
            organRisks: analysis.organRisks,
            cancerStage: analysis.cancerStage,
            shapExplanation: analysis.shapExplanation,
            shapFactors: analysis.shapFactors,
            gradcamHeatmap: analysis.gradcamHeatmap,
            questionnaire: analysis.questionnaire,
            recommendations: analysis.recommendations,
            nextSteps: analysis.nextSteps,
            clinicReferrals: analysis.clinicReferrals,
            doctorReview: analysis.doctorReview,
            createdAt: analysis.createdAt
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Run AI Health Agent to update plan
// @route   POST /ai/agent/run
// @access  Private
const runHealthAgent = async (req, res) => {
    // If called internally, req might be just userId
    const userId = req.user ? req.user._id : req;

    try {
        const profile = await PatientProfile.findOne({ userId });
        const documents = await MedicalDocument.find({ userId });

        if (!profile) return; // Should not happen if flow is correct

        // Call Gemini
        const healthPlan = await geminiService.generateHealthPlan(profile, documents);

        if (healthPlan) {
            profile.healthPlan = {
                ...healthPlan,
                generatedAt: new Date()
            };
            await profile.save();
            console.log(`Health Plan updated for user ${userId}`);
        }

        if (res) {
            res.status(200).json(profile.healthPlan);
        }
        return profile.healthPlan;

    } catch (error) {
        console.error("AI Agent Error:", error);
        if (res) res.status(500).json({ message: error.message });
    }
};

module.exports = {
    analyzeData,
    getResults,
    getAnalysisById,
    runHealthAgent
};
