const User = require('../models/user');
const Vendor = require('../models/vendor');
const DeliveryPerson = require('../models/DeliveryPerson');
const Consultant = require('../models/consultant');
const FinancialInstitution = require('../models/financialInstitution');
const Cooperative = require('../models/cooperative');
const AgroDealer = require('../models/agroDealer');
const Transporter = require('../models/transporter');
const Regulator = require('../models/regulator');
const IntegrationPartner = require('../models/integrationPartner');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../utils/notifications');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Register user (with phone)
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = new User({
            name,
            email,
            phone,        // ← phone is required
            password,
            role: role || 'customer',
            verified: false,
            approved: role === 'customer' ? true : false
        });

        await user.save();

        // Generate OTP
        const otp = user.generateOTP();
        await user.save();

        // Simulate sending OTP (log to console for testing)
        console.log(`📱 OTP for ${phone}: ${otp}`);
        console.log(`📧 OTP for ${email}: ${otp}`);

        res.status(201).json({
            success: true,
            message: 'User registered. Please verify your OTP.',
            userId: user._id,
            requiresOTP: true
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.verified = true;
        user.otp = undefined;
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,   // ← return phone
                role: user.role,
                verified: user.verified,
                approved: user.approved
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ success: false, message: 'Verification failed' });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = user.generateOTP();
        await user.save();

        console.log(`📱 New OTP for ${user.phone}: ${otp}`);
        console.log(`📧 New OTP for ${email}: ${otp}`);

        res.json({ success: true, message: 'OTP resent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ success: false, message: 'Failed to resend OTP' });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        if (!user.verified) {
            const otp = user.generateOTP();
            await user.save();
            console.log(`📱 OTP for ${user.phone}: ${otp}`);
            return res.status(403).json({
                success: false,
                message: 'Please verify your email. OTP sent.',
                requiresOTP: true
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        // Load related data — every party role gets its own dashboard payload,
        // mirroring the vendor pattern, so the frontend can route straight to
        // the right dashboard without a second lookup call.
        let vendorData = null, deliveryData = null, consultantData = null, financialData = null;
        let cooperativeData = null, agroDealerData = null, transporterData = null;
        let regulatorData = null, integrationPartnerData = null;

        if (user.role === 'vendor' && user.vendorId) {
            vendorData = await Vendor.findById(user.vendorId);
        }
        if (user.role === 'delivery' && user.deliveryId) {
            deliveryData = await DeliveryPerson.findById(user.deliveryId);
        }
        if (user.role === 'consultant' && user.consultantId) {
            consultantData = await Consultant.findById(user.consultantId);
        }
        if (user.role === 'financial' && user.financialId) {
            financialData = await FinancialInstitution.findById(user.financialId);
        }
        if (user.role === 'cooperative' && user.cooperativeId) {
            cooperativeData = await Cooperative.findById(user.cooperativeId);
        }
        if (user.role === 'agrodealer' && user.agroDealerId) {
            agroDealerData = await AgroDealer.findById(user.agroDealerId);
        }
        if (user.role === 'transporter' && user.transporterId) {
            transporterData = await Transporter.findById(user.transporterId);
        }
        if (user.role === 'regulator' && user.regulatorId) {
            regulatorData = await Regulator.findById(user.regulatorId);
        }
        if (user.role === 'integrator') {
            // Partner profile is looked up by owning user, not by a userId
            // stored on the User doc (mirrors how it's created in
            // integrationPartnerController.createPartner).
            integrationPartnerData = await IntegrationPartner.findOne({ userId: user._id });
        }

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                verified: user.verified,
                approved: user.approved,
                vendor: vendorData,
                delivery: deliveryData,
                consultant: consultantData,
                financial: financialData,
                cooperative: cooperativeData,
                agroDealer: agroDealerData,
                transporter: transporterData,
                regulator: regulatorData,
                integrationPartner: integrationPartnerData
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user' });
    }
};

exports.logout = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};