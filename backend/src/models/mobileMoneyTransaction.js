const mongoose = require('mongoose');

const MobileMoneyTransactionSchema = new mongoose.Schema({
    provider: { type: String, enum: ['mtn_momo', 'airtel_money', 'flutterwave', 'other'], required: true },
    // 'collection' = money coming IN from a user/party to the platform
    // (ad payments, digital resource purchases). Kept alongside the
    // existing loan-oriented directions rather than a separate model, since
    // it's the same rail and the same verified webhook path.
    direction: { type: String, enum: ['disbursement', 'repayment', 'refund', 'collection'], required: true },
    referenceNumber: { type: String, required: true, unique: true },
    walletNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'UGX' },
    relatedUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'success', 'failed', 'retrying'], default: 'pending' },
    retryCount: { type: Number, default: 0 },
    // What this collection payment unlocks once the webhook confirms it,
    // and which record to update. Only set for direction: 'collection'.
    purpose: { type: String, enum: ['ad_payment', 'resource_purchase'], default: undefined },
    purposeRefId: { type: mongoose.Schema.Types.ObjectId },
    rawPayload: { type: mongoose.Schema.Types.Mixed },
    receivedAt: { type: Date, default: Date.now },
    processedAt: Date
});

module.exports = mongoose.model('MobileMoneyTransaction', MobileMoneyTransactionSchema);
