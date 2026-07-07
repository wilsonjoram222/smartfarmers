const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g. 'loan_disbursed', 'kyc_verified', 'consent_recorded'
    category: {
        type: String,
        enum: ['loan_portfolio', 'consumer_consent', 'aml_flags', 'scoring_methodology'],
        required: true
    },
    actorRole: { type: String, required: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subjectId: { type: mongoose.Schema.Types.ObjectId }, // e.g. the farmer/loan/transaction referenced
    subjectType: { type: String },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
});

// Append-only: block updates and deletes at the schema level
AuditLogSchema.pre('findOneAndUpdate', function(next) {
    next(new Error('AuditLog entries are immutable and cannot be updated'));
});
AuditLogSchema.pre('findOneAndDelete', function(next) {
    next(new Error('AuditLog entries are immutable and cannot be deleted'));
});
AuditLogSchema.pre('deleteOne', function(next) {
    next(new Error('AuditLog entries are immutable and cannot be deleted'));
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
