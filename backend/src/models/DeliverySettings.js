const mongoose = require('mongoose');

const DeliverySettingsSchema = new mongoose.Schema({
    lightCargoRatePerKm: {
        type: Number,
        default: 500
    },

    heavyCargoRatePerKm: {
        type: Number,
        default: 1500
    },

    minimumDeliveryFee: {
        type: Number,
        default: 2000
    },

    maximumDistanceKm: {
        type: Number,
        default: 50
    },

    enableDeliveryFee: {
        type: Boolean,
        default: true
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});


// Update timestamp before saving
DeliverySettingsSchema.pre('save', function () {
    this.updatedAt = new Date();
});


module.exports = mongoose.model('DeliverySettings', DeliverySettingsSchema);