// Consent Service - Mock DEPA Consent Flow with Real User Integration
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');

// In-memory store for demo purposes (use Redis/DB in production)
const consentStore = new Map();

/**
 * Generate a unique consent ID and initiate consent request
 * @param {string} abhaId - Patient's email (ABHA ID)
 * @param {string} requestedBy - Doctor/Healthcare worker ID
 * @returns {object} Consent request details
 */
const initiateConsentRequest = async (abhaId, requestedBy) => {
    const consentId = uuidv4();

    // Find the patient user by email or ABHA ID
    const patient = await User.findOne({
        $or: [
            { email: abhaId },
            { abhaId: abhaId }
        ]
    });

    if (!patient) {
        throw new Error('Patient not found');
    }

    const consentRequest = {
        consentId,
        abhaId,
        patientUserId: patient._id.toString(),
        requestedBy,
        status: 'pending',
        scope: ['Health Records', 'Blood Reports', 'X-Rays', 'Prescriptions'],
        purpose: 'Cancer Screening via CureSight AI',
        validFor: '1 hour',
        requestedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        notificationSent: true,
        notificationLanguage: 'Hindi/English'
    };

    consentStore.set(consentId, consentRequest);

    // Update patient's pendingConsent field
    patient.pendingConsent = {
        consentId,
        requestedBy,
        requestedAt: new Date(),
        status: 'pending'
    };
    await patient.save();


    return consentRequest;
};

/**
 * Get current status of a consent request
 * @param {string} consentId - Consent request ID
 * @returns {object|null} Consent status or null if not found
 */
const getConsentStatus = async (consentId) => {
    let consent = consentStore.get(consentId);

    // If not in memory, try to find it in the DB via User model
    if (!consent) {
        const user = await User.findOne({ 'pendingConsent.consentId': consentId });
        if (user) {
            consent = {
                consentId: user.pendingConsent.consentId,
                status: user.pendingConsent.status,
                abhaId: user.email, // Assuming email is ABHA ID for now
                scope: ['Health Records'], // Default or retrieved if stored
                purpose: 'Cancer Screening via CureSight AI', // Default
                requestedAt: user.pendingConsent.requestedAt,
                expiresAt: new Date(new Date(user.pendingConsent.requestedAt).getTime() + 60 * 60 * 1000) // Reconstruct expiry
            };
        }
    }

    if (!consent) {
        return null;
    }

    // Check expiration
    if (new Date() > consent.expiresAt && consent.status === 'pending') {
        consent.status = 'expired';
        consentStore.set(consentId, consent);
    }

    return {
        consentId: consent.consentId,
        status: consent.status,
        abhaId: consent.abhaId,
        scope: consent.scope,
        purpose: consent.purpose,
        requestedAt: consent.requestedAt,
        approvedAt: consent.approvedAt || null,
        expiresAt: consent.expiresAt
    };
};

/**
 * Manually approve a consent (for demo/testing)
 * @param {string} consentId - Consent request ID
 * @returns {object|null} Updated consent or null if not found
 */
/**
 * Manually approve a consent (for demo/testing)
 * @param {string} consentId - Consent request ID
 * @returns {object|null} Updated consent or null if not found
 */
const approveConsent = async (consentId) => {
    let consent = consentStore.get(consentId);

    // If not in memory, try to find it in the DB via User model
    if (!consent) {
        // We need to find the user who has this consentId in pendingConsent
        const user = await User.findOne({ 'pendingConsent.consentId': consentId });
        if (user) {
            // Reconstruct a minimal consent object from DB data to allow the flow to proceed
            consent = {
                consentId: user.pendingConsent.consentId,
                patientUserId: user._id,
                status: user.pendingConsent.status
            };
        }
    }

    if (!consent) {
        return null;
    }

    if (consent.status !== 'pending') {
        return { error: `Consent already ${consent.status}` };
    }

    // Update in-memory store if it exists (or recreate it temporarily)
    consent.status = 'approved';
    consent.approvedAt = new Date();
    consentStore.set(consentId, consent);

    // Update patient's pendingConsent field in DB
    try {
        const patient = await User.findById(consent.patientUserId);
        if (patient && patient.pendingConsent && patient.pendingConsent.consentId === consentId) {
            patient.pendingConsent.status = 'approved';
            await patient.save();
        }
    } catch (error) {
        console.error('Error updating patient consent status:', error);
    }

    return consent;
};

/**
 * Reject a consent request
 * @param {string} consentId - Consent request ID
 * @returns {object|null} Updated consent or null if not found
 */
const rejectConsent = async (consentId) => {
    let consent = consentStore.get(consentId);

    // If not in memory, try to find it in the DB via User model
    if (!consent) {
        // We need to find the user who has this consentId in pendingConsent
        const user = await User.findOne({ 'pendingConsent.consentId': consentId });
        if (user) {
            // Reconstruct a minimal consent object from DB data
            consent = {
                consentId: user.pendingConsent.consentId,
                patientUserId: user._id,
                status: user.pendingConsent.status
            };
        }
    }

    if (!consent) {
        return null;
    }

    if (consent.status !== 'pending') {
        return { error: `Consent already ${consent.status}` };
    }

    consent.status = 'rejected';
    consent.rejectedAt = new Date();
    consentStore.set(consentId, consent);

    // Update patient's pendingConsent field in DB
    try {
        const patient = await User.findById(consent.patientUserId);
        if (patient && patient.pendingConsent && patient.pendingConsent.consentId === consentId) {
            patient.pendingConsent.status = 'rejected';
            await patient.save();
        }
    } catch (error) {
        console.error('Error updating patient consent status:', error);
    }

    return consent;
};

/**
 * Generate mock SMS notification content
 * @param {object} consentRequest - Consent request object
 * @returns {object} SMS notification details
 */
const generateSMSNotification = (consentRequest) => {
    return {
        to: consentRequest.abhaId,
        message: {
            en: `CureSight AI requests access to your Health History (Blood Reports, X-Rays) for Cancer Screening. Valid for ${consentRequest.validFor}. Reply YES to allow.`,
            hi: `CureSight AI आपके स्वास्थ्य इतिहास (रक्त रिपोर्ट, एक्स-रे) तक पहुंच का अनुरोध करता है। ${consentRequest.validFor} के लिए मान्य। अनुमति देने के लिए YES का जवाब दें।`
        },
        actionButtons: ['ALLOW', 'DENY'],
        timestamp: consentRequest.requestedAt
    };
};

module.exports = {
    initiateConsentRequest,
    getConsentStatus,
    approveConsent,
    rejectConsent,
    generateSMSNotification
};
