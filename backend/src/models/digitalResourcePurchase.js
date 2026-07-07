const mongoose = require('mongoose');

const DigitalResourcePurchaseSchema = new mongoose.Schema({
    resourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'DigitalResource', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'UGX' },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentReference: String,
    downloadsUsed: { type: Number, default: 0 },
    purchasedAt: { type: Date, default: Date.now },
    paidAt: Date
});

module.exports = mongoose.model('DigitalResourcePurchase', DigitalResourcePurchaseSchema);
