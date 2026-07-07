const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    farmSize: { type: Number, default: 0 }, // acres
    joinedAt: { type: Date, default: Date.now }
});

const BulkUploadSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    recordCount: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
    errorLog: [String],
    uploadedAt: { type: Date, default: Date.now }
});

const CooperativeSchema = new mongoose.Schema({
    cooperativeId: { type: String, unique: true, required: true },
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    region: { type: String, required: true },
    district: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    members: [MemberSchema],
    bulkUploads: [BulkUploadSchema],
    aggregateStats: {
        totalMembers: { type: Number, default: 0 },
        totalOutputKg: { type: Number, default: 0 },
        activeLoans: { type: Number, default: 0 },
        lastAggregatedAt: Date
    },
    approved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

CooperativeSchema.pre('save', async function(next) {
    if (!this.cooperativeId) {
        const count = await mongoose.model('Cooperative').countDocuments();
        this.cooperativeId = `COOP-${String(count + 1).padStart(4, '0')}`;
    }
    this.aggregateStats.totalMembers = this.members.length;
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Cooperative', CooperativeSchema);
