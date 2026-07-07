const User = require('../models/user');

// Get all users (admin) - supports ?role= filter
exports.getAllUsers = async (req, res) => {
    try {
        const filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.approved !== undefined) filter.approved = req.query.approved === 'true';

        const users = await User.find(filter).select('-password -otp');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
};

// Get a single user by id
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -otp');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch user' });
    }
};

// Update own profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address, profileImage } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        if (address) updates.address = address;
        if (profileImage) updates.profileImage = profileImage;

        const user = await User.findByIdAndUpdate(req.userId, updates, { new: true }).select('-password -otp');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'Profile updated', user });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// Admin: approve or reject a user (vendor/consultant/financial/delivery)
exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { approved: !!approved },
            { new: true }
        ).select('-password -otp');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: `User ${approved ? 'approved' : 'rejected'}`, user });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Admin: delete a user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user' });
    }
};
