const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true
    },

    farmerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    issuedBy: {
        type: {
            type: String,
            enum: ['financial', 'cooperative', 'admin'],
            required: true
        },
        refId: mongoose.Schema.Types.ObjectId
    },

    value: {
        type: Number,
        required: true
    },

    allowedCategories: [{
        type: String,
        enum: [
            'seeds',
            'fertilizer',
            'pesticide',
            'tools'
        ]
    }],

    status: {
        type: String,
        enum: [
            'active',
            'redeemed',
            'expired',
            'cancelled'
        ],
        default: 'active'
    },

    redeemedAt: Date,

    redeemedAtDealerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AgroDealer'
    },

    expiresAt: {
        type: Date,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});


// Generate voucher code before validation
VoucherSchema.pre('validate', function () {
    if (!this.code) {
        this.code = `VCH-${Math.random()
            .toString(36)
            .slice(2, 10)
            .toUpperCase()}`;
    }
});


module.exports = mongoose.model('Voucher', VoucherSchema);