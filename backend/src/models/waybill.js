const mongoose = require('mongoose');

const TransitPointSchema = new mongoose.Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

const WaybillSchema = new mongoose.Schema({
    waybillNumber: { type: String, unique: true, required: true },
    transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transporter', required: true },
    vehiclePlateNumber: { type: String, required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    cargo: {
        description: String,
        weightKg: Number
    },
    pickupPoint: {
        name: String,
        lat: Number,
        lng: Number
    },
    dropoffPoint: {
        name: String,
        lat: Number,
        lng: Number
    },
    transitLog: [TransitPointSchema],
    status: {
        type: String,
        enum: ['created', 'in_transit', 'delivered', 'cancelled'],
        default: 'created'
    },
    proofOfDelivery: {
        method: { type: String, enum: ['pin', 'signature', 'photo'] },
        pinCode: String,
        signatureImage: String,
        photoUrl: String,
        confirmedAt: Date
    },
    pickedUpAt: Date,
    deliveredAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

WaybillSchema.pre('save', function(next) {
    if (!this.waybillNumber) {
        this.waybillNumber = `WB-${Date.now()}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Waybill', WaybillSchema);
