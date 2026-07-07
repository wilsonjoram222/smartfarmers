const mongoose = require('mongoose');

const VariationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    }
});

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        default: ''
    },
    brand: {
        type: String,
        default: ''
    },
    tags: [{
        type: String
    }],
    cargoType: {
        type: String,
        enum: ['light', 'heavy'],
        default: 'light'
    },
    isVariable: {
        type: Boolean,
        default: false
    },
    variations: [VariationSchema],
    images: [{
        type: String
    }],
    inStock: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0
    },
    reviews: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'pending'],
        default: 'active'
    },
    views: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp before saving
ProductSchema.pre('save', function () {
    this.updatedAt = new Date();
});

module.exports = mongoose.model('Product', ProductSchema);