const Withdrawal = require('../models/withdrawal');
const Vendor = require('../models/vendor');
const DeliveryPerson = require('../models/DeliveryPerson');

// Vendor or delivery person requests a payout. They must disclose the
// specific transactions (order numbers / delivery references) the amount is
// drawn from, and those must sum to the requested amount and not exceed balance.
exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, amountUSD, account, accountName, transactions } = req.body;

        if (!['vendor', 'delivery'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Only vendors and delivery personnel can request withdrawals' });
        }
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ success: false, message: 'You must disclose the transactions this withdrawal is drawn from' });
        }
        for (const t of transactions) {
            if (!t.reference || typeof t.amount !== 'number') {
                return res.status(400).json({ success: false, message: 'Each disclosed transaction needs a reference and amount' });
            }
        }
        const disclosedTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
        if (Math.abs(disclosedTotal - Number(amount)) > 1) {
            return res.status(400).json({ success: false, message: 'Disclosed transaction total does not match the withdrawal amount' });
        }

        const type = req.user.role;
        const profile = type === 'vendor'
            ? await Vendor.findById(req.user.vendorId)
            : await DeliveryPerson.findById(req.user.deliveryId);

        if (!profile) {
            return res.status(404).json({ success: false, message: 'Profile not found — complete your registration first' });
        }
        if (Number(amount) > profile.balance) {
            return res.status(400).json({ success: false, message: `Amount exceeds available balance (${profile.balance})` });
        }

        const withdrawal = new Withdrawal({
            vendorId: type === 'vendor' ? profile._id : undefined,
            deliveryPersonId: type === 'delivery' ? profile._id : undefined,
            vendorName: type === 'vendor' ? profile.storeName : undefined,
            deliveryPersonName: type === 'delivery' ? profile.fullName : undefined,
            amount,
            amountUSD: amountUSD || amount,
            account,
            accountName,
            type,
            transactions
        });
        await withdrawal.save();

        res.status(201).json({ success: true, message: 'Withdrawal requested, pending admin approval', withdrawal });
    } catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({ success: false, message: 'Failed to request withdrawal' });
    }
};

// Requester's own withdrawal history
exports.getMyWithdrawals = async (req, res) => {
    try {
        let filter;
        if (req.user.role === 'vendor') filter = { vendorId: req.user.vendorId };
        else if (req.user.role === 'delivery') filter = { deliveryPersonId: req.user.deliveryId };
        else return res.status(403).json({ success: false, message: 'Access denied' });

        const withdrawals = await Withdrawal.find(filter).sort({ requestedAt: -1 });
        res.json({ success: true, count: withdrawals.length, withdrawals });
    } catch (error) {
        console.error('Get my withdrawals error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
    }
};

// Admin: full queue, optional ?status= / ?type= filters
exports.getAllWithdrawals = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.type) filter.type = req.query.type;
        const withdrawals = await Withdrawal.find(filter).sort({ requestedAt: -1 });
        res.json({ success: true, count: withdrawals.length, withdrawals });
    } catch (error) {
        console.error('Get all withdrawals error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch withdrawals' });
    }
};

// Admin approves or rejects. Approval deducts from the requester's balance.
exports.setWithdrawalStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Status must be 'approved' or 'rejected'" });
        }

        const withdrawal = await Withdrawal.findById(req.params.id);
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Withdrawal not found' });
        }
        if (withdrawal.status !== 'pending') {
            return res.status(400).json({ success: false, message: `Withdrawal already ${withdrawal.status}` });
        }

        if (status === 'approved') {
            const Model = withdrawal.type === 'vendor' ? Vendor : DeliveryPerson;
            const profileId = withdrawal.type === 'vendor' ? withdrawal.vendorId : withdrawal.deliveryPersonId;
            const profile = await Model.findById(profileId);
            if (!profile || withdrawal.amount > profile.balance) {
                return res.status(400).json({ success: false, message: 'Balance no longer covers this withdrawal' });
            }
            profile.balance -= withdrawal.amount;
            await profile.save();
            withdrawal.status = 'approved';
            withdrawal.approvedAt = new Date();
        } else {
            withdrawal.status = 'rejected';
            withdrawal.rejectedAt = new Date();
            withdrawal.rejectionReason = rejectionReason || '';
        }
        await withdrawal.save();

        res.json({ success: true, message: `Withdrawal ${withdrawal.status}`, withdrawal });
    } catch (error) {
        console.error('Set withdrawal status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update withdrawal' });
    }
};
