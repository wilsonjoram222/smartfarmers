const mongoose = require('mongoose');
const crypto = require('crypto');

const IntegrationConfigSchema = new mongoose.Schema({
    provider: {
        type: String,
        enum: ['mtn_momo', 'airtel_money', 'flutterwave', 'other'],
        required: true,
        unique: true
    },
    displayName: { type: String, required: true },
    environment: { type: String, enum: ['sandbox', 'production'], default: 'sandbox' },
    webhookUrl: { type: String, required: true }, // our inbound endpoint, shared with the partner
    webhookSecretHash: { type: String, required: true }, // HMAC secret is hashed, never stored plaintext
    isActive: { type: Boolean, default: true },
    lastEventAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

IntegrationConfigSchema.statics.hashSecret = function(rawSecret) {
    return crypto.createHash('sha256').update(rawSecret).digest('hex');
};

IntegrationConfigSchema.methods.verifySignature = function(rawSecret, payload, signature) {
    const expected = crypto.createHmac('sha256', rawSecret).update(payload).digest('hex');
    const expectedBuf = Buffer.from(expected);
    const givenBuf = Buffer.from(signature || '');
    if (expectedBuf.length !== givenBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, givenBuf);
};

IntegrationConfigSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('IntegrationConfig', IntegrationConfigSchema);
