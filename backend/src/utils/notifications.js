const Notification = require('../models/notification');
const User = require('../models/user');

async function createNotification(io, target, title, description, type = 'info', link = '', userId = null) {
    try {
        let targetUserId = userId;
        let targetUser = null;
        if (target !== 'admin') {
            targetUser = await User.findOne({ email: target });
            if (targetUser) targetUserId = targetUser._id;
        }
        const notification = new Notification({
            target,
            title,
            description,
            type,
            link,
            userId: targetUserId
        });
        await notification.save();
        if (io) {
            if (target === 'admin') {
                io.to('admin_room').emit('new-notification', notification);
            } else if (targetUserId) {
                io.to(`user_${targetUserId}`).emit('new-notification', notification);
            }
        }
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

async function notifyMultiple(io, recipients, title, description, type = 'info') {
    const results = [];
    for (const recipient of recipients) {
        const result = await createNotification(io, recipient, title, description, type);
        results.push(result);
    }
    return results;
}

module.exports = { createNotification, notifyMultiple };