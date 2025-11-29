const crypto = require('crypto');
const axios = require('axios');
const OTP = require('../models/OTP');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const hashOTP = (otp) => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

const sendOTP = async (email) => {
    // Check for existing OTP to prevent spam
    const existingOTP = await OTP.findOne({ email });
    if (existingOTP && existingOTP.resendAllowedAt > new Date()) {
        throw new Error('Please wait before requesting another OTP');
    }

    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const resendAllowedAt = new Date(Date.now() + 30 * 1000); // 30 seconds

    // Save to DB
    // If entry exists, update it, otherwise create new
    await OTP.findOneAndUpdate(
        { email },
        { otpHash, expiresAt, resendAllowedAt },
        { upsert: true, new: true }
    );

    // Call Webhook with new format
    const webhookUrl = 'https://n8n-latest-wsv0.onrender.com/webhook/mail';

    console.log('=== OTP WEBHOOK DEBUG ===');
    console.log(`Email: ${email}`);
    // console.log(`OTP Generated: ${otp}`); // Security: Don't log plain OTP in production
    console.log(`Using webhook URL: ${webhookUrl}`);

    try {
        const subject = 'AarogyaAi OTP Verification';
        const message = `Your OTP for AarogyaAi login/registration is ${otp}. It is valid for 5 minutes. Do NOT share this with anyone.`;

        // Build the complete URL
        const fullUrl = `${webhookUrl}?email=${encodeURIComponent(email)}&sub=${encodeURIComponent(subject)}&message=${encodeURIComponent(message)}`;

        console.log(`Attempting to call webhook...`);

        // Fire and forget - we don't need to wait for response strictly, but for debugging we log it
        const response = await axios.get(fullUrl, { timeout: 10000 });

        console.log(`✅ Webhook call SUCCESS`);
        console.log(`Response status: ${response.status}`);
        console.log('=== END DEBUG ===');
    } catch (error) {
        console.error('❌ Webhook call FAILED');
        console.error('Error message:', error.message);
        // We don't throw error here to the user, because we want to show "OTP sent" regardless
        // to prevent email enumeration, and also if webhook fails, we can't do much.
        // However, for this specific requirement, if webhook fails, user won't get OTP.
        // But the requirement says "Frontend always displays: 'OTP sent (if email exists)'"
    }

    return true;
};

const verifyOTP = async (email, otp) => {
    const record = await OTP.findOne({ email });

    if (!record) {
        throw new Error('OTP not found or expired');
    }

    const inputHash = hashOTP(otp);

    if (record.otpHash !== inputHash) {
        throw new Error('Invalid OTP');
    }

    if (record.expiresAt < new Date()) {
        throw new Error('OTP expired');
    }

    // Delete OTP after successful verification
    await OTP.deleteOne({ _id: record._id });

    return true;
};

module.exports = {
    sendOTP,
    verifyOTP,
};
