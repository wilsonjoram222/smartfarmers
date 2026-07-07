const Regulator = require('../models/regulator');
const AuditLog = require('../models/auditLog');
const User = require('../models/user');

exports.getAllRegulators = async (req, res) => {
    try {
        const regulators = await Regulator.find();
        res.json({ success: true, count: regulators.length, regulators });
    } catch (error) {
        console.error('Get regulators error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch regulators' });
    }
};

exports.createRegulator = async (req, res) => {
    try {
        const { institutionName, jurisdiction, contactPerson, phone, email, accessScope } = req.body;
        const regulator = new Regulator({
            institutionName, jurisdiction, contactPerson, phone, email, accessScope,
            userId: req.userId
        });
        await regulator.save();
        await User.findByIdAndUpdate(req.userId, { regulatorId: regulator._id });
        res.status(201).json({ success: true, message: 'Regulator account registered, pending approval', regulator });
    } catch (error) {
        console.error('Create regulator error:', error);
        res.status(500).json({ success: false, message: 'Failed to register regulator' });
    }
};

exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const regulator = await Regulator.findByIdAndUpdate(req.params.id, { approved: !!approved }, { new: true });
        if (!regulator) {
            return res.status(404).json({ success: false, message: 'Regulator not found' });
        }
        res.json({ success: true, message: `Regulator ${approved ? 'approved' : 'rejected'}`, regulator });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Read-only: audit log, filtered to the requesting regulator's approved access scope
exports.getAuditLog = async (req, res) => {
    try {
        const regulator = await Regulator.findOne({ userId: req.userId });
        if (!regulator || !regulator.approved) {
            return res.status(403).json({ success: false, message: 'Regulator account not approved for access' });
        }

        const filter = { category: { $in: regulator.accessScope } };
        if (req.query.category) {
            if (!regulator.accessScope.includes(req.query.category)) {
                return res.status(403).json({ success: false, message: 'Category outside approved access scope' });
            }
            filter.category = req.query.category;
        }
        if (req.query.from || req.query.to) {
            filter.createdAt = {};
            if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
            if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
        }

        const logs = await AuditLog.find(filter).sort({ createdAt: -1 }).limit(500);
        res.json({ success: true, count: logs.length, logs });
    } catch (error) {
        console.error('Get audit log error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch audit log' });
    }
};

// Internal helper other controllers can call to append immutable audit entries
exports.recordAuditEvent = async ({ action, category, actorRole, actorId, subjectId, subjectType, metadata }) => {
    try {
        await AuditLog.create({ action, category, actorRole, actorId, subjectId, subjectType, metadata });
    } catch (error) {
        console.error('Audit log write failed:', error);
    }
};
