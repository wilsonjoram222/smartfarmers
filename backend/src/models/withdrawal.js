const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    deliveryPersonId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryPerson' },
    vendorName: String,
    deliveryPersonName: String,
    amount: { type: Number, required: true },
    amountUSD: { type: Number, required: true },
    account: { type: String, required: true },
    accountName: { type: String, required: true },
    type: { type: String, enum: ['vendor', 'delivery'], required: true },
    // Disclosure of exactly which transactions/deliveries this withdrawal is
    // drawn from — required before a request can be submitted, must sum to `amount`.
    transactions: [{
        reference: { type: String, required: true },  // orderNumber or waybill/delivery reference
        amount: { type: Number, required: true },
        date: Date
    }],
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: Date,
    rejectedAt: Date,
    rejectionReason: String
});

module.exports = mongoose.model('Withdrawal', WithdrawalSchema);