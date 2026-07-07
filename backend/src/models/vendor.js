const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    vendorId: {
        type: String,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    storeName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    goodsTypes: [{
        type: String,
        enum: [
            'Seeds',
            'Fertilizers',
            'Crop Protection',
            'Tools',
            'Livestock',
            'Harvest'
        ]
    }],
    location: {
        address: String,
        city: String,
        district: String,
        country: {
            type: String,
            default: 'Uganda'
        },
        lat: {
            type: Number,
            default: 0.3136
        },
        lng: {
            type: Number,
            default: 32.5811
        }
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    logo: {
        type: String,
        default: ''
    },
    approved: {
        type: Boolean,
        default: false
    },
    earnings: {
        type: Number,
        default: 0
    },
    balance: {
        type: Number,
        default: 0
    },
    commission: {
        type: Number,
        default: 5
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Auto-generate Vendor ID
VendorSchema.pre('validate', async function () {
    if (!this.vendorId) {
        const count = await mongoose.model('Vendor').countDocuments();
        this.vendorId = `VENDOR-${String(count + 1).padStart(4, '0')}`;
    }
});

module.exports = mongoose.model('Vendor', VendorSchema);