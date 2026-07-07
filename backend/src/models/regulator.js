const mongoose = require('mongoose');

const RegulatorSchema = new mongoose.Schema({
    regulatorId: {
        type: String,
        unique: true
    },
    institutionName: {
        type: String,
        required: true,
        trim: true
    },
    jurisdiction: {
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
    accessScope: [{
        type: String,
        enum: [
            'loan_portfolio',
            'consumer_consent',
            'aml_flags',
            'scoring_methodology'
        ]
    }],
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

// Generate regulator ID before validation
RegulatorSchema.pre('validate', async function () {
    if (!this.regulatorId) {
        const count = await mongoose.model('Regulator').countDocuments();

        this.regulatorId = `REG-${String(count + 1).padStart(4, '0')}`;
    }

    this.updatedAt = new Date();
});

module.exports = mongoose.model('Regulator', RegulatorSchema);