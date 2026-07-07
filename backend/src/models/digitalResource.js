const mongoose = require('mongoose');

// Purchasable PDF listed on the main storefront (e.g. a consultant's advisory
// report, a financial institution's loan guide). storedFilename points into
// the PRIVATE upload dir (see middleware/upload.js) — never exposed directly;
// customers only ever get it via digitalResourceController.downloadResource
// after a verified purchase.
const DigitalResourceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, default: 'General' },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'UGX' },
    coverImage: { type: String, default: '' },

    storedFilename: { type: String, required: true },
    originalFilename: { type: String, default: '' },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerRole: { type: String, required: true },
    ownerName: { type: String, default: '' },

    status: { type: String, enum: ['pending', 'active', 'rejected', 'inactive'], default: 'pending' },
    rejectionReason: String,

    purchasesCount: { type: Number, default: 0 },
    downloadsCount: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

DigitalResourceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('DigitalResource', DigitalResourceSchema);
