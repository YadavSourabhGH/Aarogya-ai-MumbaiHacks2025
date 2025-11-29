const consentService = require('../services/consentService');
const emailService = require('../services/emailService');
const User = require('../models/User');


// @desc    Initiate consent request for ABHA ID
// @route   POST /consent/request
// @access  Private
const requestConsent = async (req, res) => {
    try {
        const { abhaId } = req.body;

        // Validate ABHA ID format (allow @abha format)
        const abhaRegex = /^[^\s@]+@[^\s@]+$/;
        if (!abhaId || !abhaRegex.test(abhaId)) {
            return res.status(400).json({ message: 'Invalid ABHA ID format. Expected format: user@abha or user@domain.com' });
        }

        const requestedBy = req.user._id.toString();
        const consentRequest = await consentService.initiateConsentRequest(abhaId, requestedBy);
        const smsNotification = consentService.generateSMSNotification(consentRequest);

        // Send email notification to patient
        try {
            console.log('📧 Attempting to send consent email to:', abhaId);
            const patient = await User.findOne({
                $or: [
                    { email: abhaId },
                    { abhaId: abhaId }
                ]
            });

            if (!patient) {
                console.log('❌ Patient not found for email:', abhaId);
            } else {
                console.log('✅ Patient found:', patient.name);
                const doctor = await User.findById(requestedBy);
                const doctorName = doctor ? doctor.name : 'A Doctor';
                console.log('📧 Sending consent email from:', doctorName, 'to:', patient.name);

                const emailSent = await emailService.sendConsentRequestEmail(
                    patient.email,
                    patient.name,
                    doctorName,
                    consentRequest.consentId
                );

                console.log('📧 Email sent status:', emailSent);
            }
        } catch (emailError) {
            console.error('📧 Email sending error:', emailError.message);
            // Don't fail the request if email fails
        }

        res.status(200).json({
            success: true,
            message: 'Consent request initiated successfully',
            consent: {
                consentId: consentRequest.consentId,
                status: consentRequest.status,
                abhaId: consentRequest.abhaId,
                scope: consentRequest.scope,
                purpose: consentRequest.purpose,
                validFor: consentRequest.validFor,
                expiresAt: consentRequest.expiresAt
            },
            notification: smsNotification
        });

    } catch (error) {
        console.error('Consent Request Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get consent status
// @route   GET /consent/status/:consentId
// @access  Private
const getConsentStatus = async (req, res) => {
    try {
        const { consentId } = req.params;

        const consentStatus = await consentService.getConsentStatus(consentId);

        if (!consentStatus) {
            return res.status(404).json({ message: 'Consent request not found' });
        }

        res.status(200).json({
            success: true,
            consent: consentStatus
        });

    } catch (error) {
        console.error('Get Consent Status Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually approve consent (for demo/testing)
// @route   POST /consent/approve/:consentId
// @access  Private
const approveConsent = async (req, res) => {
    try {
        const { consentId } = req.params;

        const result = await consentService.approveConsent(consentId);

        if (!result) {
            return res.status(404).json({ message: 'Consent request not found' });
        }

        if (result.error) {
            return res.status(400).json({ message: result.error });
        }

        res.status(200).json({
            success: true,
            message: 'Consent approved successfully',
            consent: {
                consentId: result.consentId,
                status: result.status,
                approvedAt: result.approvedAt
            }
        });

    } catch (error) {
        console.error('Approve Consent Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject consent
// @route   POST /consent/reject/:consentId
// @access  Private
const rejectConsent = async (req, res) => {
    try {
        const { consentId } = req.params;

        const result = await consentService.rejectConsent(consentId);

        if (!result) {
            return res.status(404).json({ message: 'Consent request not found' });
        }

        if (result.error) {
            return res.status(400).json({ message: result.error });
        }

        res.status(200).json({
            success: true,
            message: 'Consent rejected',
            consent: {
                consentId: result.consentId,
                status: result.status,
                rejectedAt: result.rejectedAt
            }
        });

    } catch (error) {
        console.error('Reject Consent Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    requestConsent,
    getConsentStatus,
    approveConsent,
    rejectConsent
};
