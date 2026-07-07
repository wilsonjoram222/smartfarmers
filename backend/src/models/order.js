const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: String,
    price: Number,
    qty: Number,
    variation: String,
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    }
});


const OrderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },

    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    customerName: String,
    customerEmail: String,
    customerPhone: String,

    deliveryAddress: {
        street: String,
        city: String,
        district: String,
        country: String,
        lat: Number,
        lng: Number
    },

    items: [OrderItemSchema],

    vendorIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    }],

    subtotal: {
        type: Number,
        required: true
    },

    deliveryFee: {
        type: Number,
        default: 0
    },

    deliveryDetails: [{
        vendorName: String,
        fee: Number,
        distance: Number
    }],

    tax: {
        type: Number,
        default: 0
    },

    discount: {
        type: Number,
        default: 0
    },

    couponCode: String,

    totalUSD: {
        type: Number,
        required: true
    },

    totalLocal: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: [
            'pending',
            'shipped',
            'assigned_to_delivery',
            'picked',
            'in_transit',
            'delivered',
            'completed',
            'rejected',
            'cancelled'
        ],
        default: 'pending'
    },

    paymentMethod: {
        type: String,
        enum: [
            'mobile_money',
            'bank_transfer',
            'card',
            'cash'
        ],
        default: 'mobile_money'
    },

    paymentStatus: {
        type: String,
        enum: [
            'pending',
            'paid',
            'failed',
            'refunded'
        ],
        default: 'pending'
    },

    rejectionReason: String,
    rejectionMessage: String,

    shippedAt: Date,
    deliveredAt: Date,
    completedAt: Date,
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


// Generate order number before validation
OrderSchema.pre('validate', async function () {

    if (!this.orderNumber) {

        const count = await mongoose.model('Order')
            .countDocuments();

        this.orderNumber =
            `ORD-${String(count + 1).padStart(6, '0')}`;
    }

    this.updatedAt = new Date();
});


module.exports = mongoose.model('Order', OrderSchema);