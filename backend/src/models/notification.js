const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    target: { type: String, required: true }, // email or 'admin'
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'success', 'warning', 'error'],
        default: 'info'
    },
    read: { type: Boolean, default: false },
    link: { type: String, default: '' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);