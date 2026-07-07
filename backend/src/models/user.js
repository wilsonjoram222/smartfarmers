const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [
            'admin',
            'customer',
            'vendor',
            'consultant',
            'financial',
            'delivery',
            'cooperative',
            'agrodealer',
            'transporter',
            'regulator',
            'integrator'
        ],
        default: 'customer'
    },
    verified: {
        type: Boolean,
        default: false
    },
    approved: {
        type: Boolean,
        default: false
    },
    address: {
        street: String,
        city: String,
        district: String,
        country: {
            type: String,
            default: 'Uganda'
        },
        lat: Number,
        lng: Number
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    },
    consultantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultant'
    },
    financialId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FinancialInstitution'
    },
    deliveryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPerson'
    },
    cooperativeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cooperative'
    },
    agroDealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgroDealer'
    },
    transporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transporter'
    },
    regulatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Regulator'
    },
    integrationPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IntegrationPartner'
    },
    profileImage: {
        type: String,
        default: ''
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    lastLogin: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function () {
    this.updatedAt = new Date();

    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
UserSchema.methods.generateOTP = function () {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.otp = {
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    };

    return code;
};

module.exports = mongoose.model('User', UserSchema);