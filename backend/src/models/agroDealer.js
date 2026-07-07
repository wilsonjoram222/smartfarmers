const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    barcode: { type: String, default: '' },
    category: { type: String, enum: ['seeds', 'fertilizer', 'pesticide', 'tools'], required: true },
    stockLevel: { type: Number, default: 0 },
    unitPrice: { type: Number, required: true },
    certified: { type: Boolean, default: false },
    verificationTag: { type: String, default: '' }, // genuine input verification tag
    updatedAt: { type: Date, default: Date.now }
});

const SaleReceiptSchema = new mongoose.Schema({
    receiptNumber: { type: String, required: true },
    customerPhone: { type: String, required: true },
    items: [{
        sku: String,
        name: String,
        quantity: Number,
        unitPrice: Number
    }],
    total: { type: Number, required: true },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
    smsSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const AgroDealerSchema = new mongoose.Schema({
    dealerId: { type: String, unique: true, required: true },
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    location: {
        address: String,
        district: String,
        country: { type: String, default: 'Uganda' },
        lat: { type: Number, default: 0.3136 },
        lng: { type: Number, default: 32.5811 }
    },
    inventory: [InventoryItemSchema],
    receipts: [SaleReceiptSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    joinedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AgroDealerSchema.pre('save', async function(next) {
    if (!this.dealerId) {
        const count = await mongoose.model('AgroDealer').countDocuments();
        this.dealerId = `AGD-${String(count + 1).padStart(4, '0')}`;
    }
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('AgroDealer', AgroDealerSchema);
