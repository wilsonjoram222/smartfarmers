const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    link: { type: String, default: '#' },
    position: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

BannerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Banner', BannerSchema);