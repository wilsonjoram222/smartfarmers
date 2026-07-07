const mongoose = require('mongoose');

// Business-facing partner profile for MNOs and fintech integrators.
// Separate from IntegrationConfig, which holds the admin-managed technical
// webhook secret/endpoint once a partner has been approved and onboarded.
const IntegrationPartnerSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    partnerType: {
        type: String,
        enum: ['mno', 'fintech', 'payment_aggregator', 'other'],
        required: true
    },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true, trim: true },
    phone: { type: String, required: true },
    country: { type: String, default: 'Uganda' },
    // Which providers this partner wants to integrate (maps to IntegrationConfig.provider once configured)
    requestedProviders: [{ type: String, enum: ['mtn_momo', 'airtel_money', 'flutterwave', 'other'] }],
    useCase: { type: String, trim: true }, // e.g. "loan disbursement + repayment routing"
    approved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Once approved and configured, links to the technical webhook/config record
    integrationConfigId: { type: mongoose.Schema.Types.ObjectId, ref: 'IntegrationConfig' },
    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

IntegrationPartnerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('IntegrationPartner', IntegrationPartnerSchema);
