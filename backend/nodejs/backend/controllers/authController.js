const User = require('../models/User');
const PatientProfile = require('../models/PatientProfile');
const HospitalProfile = require('../models/HospitalProfile');
const OTP = require('../models/OTP');
const otpService = require('../services/otpService');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const generateSignupToken = (email) => {
    return jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: '15m',
    });
};

// @desc    Send OTP
// @route   POST /auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        await otpService.sendOTP(email);
        res.status(200).json({ message: 'OTP sent (if email exists)' });
    } catch (error) {
        res.status(200).json({ message: 'OTP sent (if email exists)' });
    }
};

// @desc    Verify OTP
// @route   POST /auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        await otpService.verifyOTP(email, otp);

        const user = await User.findOne({ email });

        if (user) {
            // User exists -> Login Flow
            res.status(200).json({
                valid: true,
                message: 'OTP verified',
                isNewUser: false,
                token: generateToken(user._id),
                role: user.role,
                name: user.name
            });
        } else {
            // User does not exist -> Signup Flow
            const signupToken = generateSignupToken(email);
            res.status(200).json({
                valid: true,
                message: 'OTP verified',
                isNewUser: true,
                signupToken
            });
        }
    } catch (error) {
        res.status(400).json({
            valid: false,
            message: error.message || 'Invalid or expired OTP'
        });
    }
};

// @desc    Register a new user
// @route   POST /auth/signup
// @access  Public
const signup = async (req, res) => {
    const { name, password, signupToken, role, hospitalDetails } = req.body; // role: 'patient' or 'hospital'

    try {
        if (!signupToken) {
            return res.status(401).json({ message: 'Not authorized, no signup token' });
        }

        let decoded;
        try {
            decoded = jwt.verify(signupToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired signup token' });
        }
        const email = decoded.email;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'patient',
        });

        if (user) {
            // Create Profile based on role
            if (user.role === 'patient') {
                await PatientProfile.create({ userId: user._id });
            } else if (user.role === 'hospital' && hospitalDetails) {
                await HospitalProfile.create({
                    userId: user._id,
                    name: hospitalDetails.name || name,
                    address: hospitalDetails.address || 'Not Provided',
                    // ... other fields
                });
            }

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get current user data with pending consent
// @route   GET /api/user/me
// @access  Private
const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendOtp,
    verifyOtp,
    signup,
    login,
    getCurrentUser
};
