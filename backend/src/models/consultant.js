const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
    id: { type: Number, default: Date.now },
    title: { type: String, required: true },
    description: String,
    price: String,
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

const FeedbackSchema = new mongoose.Schema({
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

const ConsultantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    phone: { type: String, required: true },
    specialty: { type: String, default: 'Agriculture Expert' },
    bio: { type: String, default: '' },
    icon: { type: String, default: 'fa-user-md' },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    approved: { type: Boolean, default: false },
    services: [ServiceSchema],
    feedbacks: [FeedbackSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

ConsultantSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Consultant', ConsultantSchema);