const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    plateNumber: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['pickup', 'van', 'truck', 'trailer'],
        required: true
    },
    capacityKg: {
        type: Number,
        required: true
    },
    driverName: {
        type: String,
        required: true
    },
    driverPhone: {
        type: String,
        required: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPerson'
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const TransporterSchema = new mongoose.Schema({
    transporterId: {
        type: String,
        unique: true
    },
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    licenseNumber: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    region: {
        type: String,
        required: true
    },
    vehicles: [VehicleSchema],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approved: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Generate transporter ID before validation
TransporterSchema.pre('validate', async function () {
    if (!this.transporterId) {
        const count = await mongoose.model('Transporter').countDocuments();

        this.transporterId = `TRN-${String(count + 1).padStart(4, '0')}`;
    }

    this.updatedAt = new Date();
});

module.exports = mongoose.model('Transporter', TransporterSchema);