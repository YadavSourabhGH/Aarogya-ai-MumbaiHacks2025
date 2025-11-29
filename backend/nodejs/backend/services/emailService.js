const axios = require('axios');

/**
 * Email Service for sending consent notifications via n8n webhook
 */

const WEBHOOK_URL = 'https://n8n-latest-wsv0.onrender.com/webhook/mail';

/**
 * Send consent request email to patient
 * @param {string} patientEmail - Patient's email address
 * @param {string} patientName - Patient's name
 * @param {string} doctorName - Doctor requesting consent
 * @param {string} consentId - Consent request ID
 * @returns {Promise<boolean>} - Success status
 */
const sendConsentRequestEmail = async (patientEmail, patientName, doctorName, consentId) => {
    try {
        const emailSubject = `Consent Request from ${doctorName} - AarogyaAI`;
        const emailBody = `Dear ${patientName},

Dr. ${doctorName} has requested access to your medical records through AarogyaAI.

To review and approve this consent request, please log in to your account and visit the Consent page at:
${process.env.FRONTEND_URL || 'http://localhost:5173'}/consent

Request Details:
- Requested by: Dr. ${doctorName}
- Request ID: ${consentId}
- Purpose: Medical consultation and AI-powered health analysis
- Scope: Medical records, lab reports, and imaging studies

Please approve or deny this request within 24 hours. If you do not recognize this request, please contact support immediately.

Thank you,
AarogyaAI Team`;

        console.log('=== CONSENT EMAIL WEBHOOK DEBUG ===');
        console.log('Patient Email:', patientEmail);
        console.log('Doctor:', doctorName);
        console.log('Consent ID:', consentId);
        console.log('Using webhook URL:', WEBHOOK_URL);
        console.log('Attempting to call webhook...');

        const response = await axios.post(WEBHOOK_URL, {
            email: patientEmail,
            subject: emailSubject,
            body: emailBody,  // Changed from 'otp' to 'body'
            type: 'consent'   // Added type to differentiate
        });

        console.log('✅ Webhook call SUCCESS');
        console.log('Response status:', response.status);
        console.log('=== END DEBUG ===');

        return true;
    } catch (error) {
        console.error('❌ Consent email webhook ERROR:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        console.log('=== END DEBUG ===');

        // For now, return true even if email fails so consent flow continues
        console.log('⚠️  Continuing without email notification...');
        return true;
    }
};

module.exports = {
    sendConsentRequestEmail
};
