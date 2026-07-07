const mongoose = require('mongoose');

// Any party (vendor, consultant, financial, cooperative, agrodealer, transporter,
// regulator, delivery, integrator) can request a slot on the main landing page.
// Flow: party requests -> admin sets the price for the requested duration ->
// party pays -> ad goes live for that window. First-ever ad per party skips
// pricing/payment entirely (one month free), everything after that is paid.
const AdvertisementSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ownerRole: { type: String, required: true },
    ownerName: { type: String, default: '' },

    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '#' },

    // Where on the landing page it can render — kept small and fixed so the
    // frontend has known slots to lay out rather than arbitrary positions.
    placement: {
        type: String,
        enum: ['landing_hero', 'landing_sidebar', 'landing_footer'],
        default: 'landing_sidebar'
    },

    durationDays: { type: Number, required: true, min: 1 },
    price: { type: Number, default: 0 },       // 0 until admin sets it (or free trial)
    currency: { type: String, default: 'UGX' },
    isFreeTrial: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['pending_review', 'awaiting_payment', 'active', 'expired', 'rejected', 'deleted'],
        default: 'pending_review'
    },
    paid: { type: Boolean, default: false },
    paidAt: Date,

    startDate: Date,
    endDate: Date,

    rejectionReason: String,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: Date,
    deletionReason: String,

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

AdvertisementSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Advertisement', AdvertisementSchema);
