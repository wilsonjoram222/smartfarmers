const mongoose = require('mongoose');

const DeliveryPersonSchema = new mongoose.Schema({
    uniqueId: { type: String, unique: true, required: true },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    vehicleType: {
        type: String,
        enum: ['Motorcycle', 'Car', 'Van', 'Truck', 'Bicycle', 'Boda'],
        required: true
    },
    vehicleModel: { type: String, default: 'N/A' },
    licenseNumber: { type: String, required: true },
    permitNumber: { type: String, required: true },
    nationalId: { type: String, required: true },
    photo: { type: String, default: '' },
    currentLocation: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
        updatedAt: Date
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    earnings: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    withdrawals: [{
        amount: Number,
        accountDetails: String,
        accountName: String,
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        requestedAt: { type: Date, default: Date.now },
        approvedAt: Date,
        rejectedAt: Date
    }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

DeliveryPersonSchema.pre('save', async function(next) {
    if (!this.uniqueId) {
        const prefix = {
            'Motorcycle': 'MC',
            'Car': 'CAR',
            'Van': 'VAN',
            'Truck': 'TRK',
            'Bicycle': 'BIC',
            'Boda': 'BODA'
        }[this.vehicleType] || 'DLV';
        const count = await mongoose.model('DeliveryPerson').countDocuments();
        this.uniqueId = `${prefix}-${String(count + 1).padStart(4, '0')}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DeliveryPerson', DeliveryPersonSchema);