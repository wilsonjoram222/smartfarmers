const mongoose = require('mongoose');

const DeliveryRequestSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },

    deliveryPersonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPerson',
        required: true
    },

    status: {
        type: String,
        enum: [
            'pending_acceptance',
            'assigned',
            'picked',
            'in_transit',
            'delivered',
            'rejected'
        ],
        default: 'pending_acceptance'
    },

    vendorLat: Number,
    vendorLng: Number,

    customerLat: Number,
    customerLng: Number,

    currentLat: Number,
    currentLng: Number,

    lastUpdate: Date,

    assignedAt: Date,
    acceptedAt: Date,
    pickedAt: Date,
    deliveredAt: Date,
    rejectedAt: Date,

    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    }
});


// Update timestamp before saving
DeliveryRequestSchema.pre('save', function () {
    this.updatedAt = new Date();
});


module.exports = mongoose.model('DeliveryRequest', DeliveryRequestSchema);