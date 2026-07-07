const mongoose = require('mongoose');

const FinancialServiceSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    title: { type: String, required: true },
    description: String,
    rate: String,
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const FinancialFeedbackSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    customerName: String,
    customerEmail: String,
    inquiryType: String,
    description: String,
    status: { type: String, enum: ['pending', 'responded', 'closed'], default: 'pending' },
    response: String,
    date: { type: Date, default: Date.now },
    respondedAt: Date
});

const FinancialInstitutionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, default: 'Financial Partner' },
    email: { type: String, required: true, lowercase: true, unique: true },
    phone: { type: String, required: true },
    approved: { type: Boolean, default: false },
    services: [FinancialServiceSchema],
    feedbacks: [FinancialFeedbackSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

FinancialInstitutionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('FinancialInstitution', FinancialInstitutionSchema);