const Cooperative = require('../models/cooperative');
const User = require('../models/user');

exports.getAllCooperatives = async (req, res) => {
    try {
        const filter = req.query.approved !== undefined ? { approved: req.query.approved === 'true' } : {};
        const cooperatives = await Cooperative.find(filter).select('-members -bulkUploads');
        res.json({ success: true, count: cooperatives.length, cooperatives });
    } catch (error) {
        console.error('Get cooperatives error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cooperatives' });
    }
};

exports.getCooperativeById = async (req, res) => {
    try {
        const cooperative = await Cooperative.findById(req.params.id);
        if (!cooperative) {
            return res.status(404).json({ success: false, message: 'Cooperative not found' });
        }
        res.json({ success: true, cooperative });
    } catch (error) {
        console.error('Get cooperative error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch cooperative' });
    }
};

exports.createCooperative = async (req, res) => {
    try {
        const { name, registrationNumber, email, phone, region, district } = req.body;
        const cooperative = new Cooperative({
            name, registrationNumber, email, phone, region, district,
            managerId: req.userId
        });
        await cooperative.save();
        await User.findByIdAndUpdate(req.userId, { cooperativeId: cooperative._id });
        res.status(201).json({ success: true, message: 'Cooperative registered, pending approval', cooperative });
    } catch (error) {
        console.error('Create cooperative error:', error);
        res.status(500).json({ success: false, message: 'Failed to register cooperative' });
    }
};

exports.updateCooperative = async (req, res) => {
    try {
        const cooperative = await Cooperative.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!cooperative) {
            return res.status(404).json({ success: false, message: 'Cooperative not found' });
        }
        res.json({ success: true, message: 'Cooperative updated', cooperative });
    } catch (error) {
        console.error('Update cooperative error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cooperative' });
    }
};

// Admin: approve/reject cooperative
exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const cooperative = await Cooperative.findByIdAndUpdate(req.params.id, { approved: !!approved }, { new: true });
        if (!cooperative) {
            return res.status(404).json({ success: false, message: 'Cooperative not found' });
        }
        res.json({ success: true, message: `Cooperative ${approved ? 'approved' : 'rejected'}`, cooperative });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Add a single member
exports.addMember = async (req, res) => {
    try {
        const { name, phone, farmSize, farmerId } = req.body;
        const cooperative = await Cooperative.findById(req.params.id);
        if (!cooperative) {
            return res.status(404).json({ success: false, message: 'Cooperative not found' });
        }
        cooperative.members.push({ name, phone, farmSize, farmerId });
        await cooperative.save();
        res.status(201).json({ success: true, message: 'Member added', memberCount: cooperative.members.length });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({ success: false, message: 'Failed to add member' });
    }
};

// Bulk CSV upload — expects pre-parsed array of {name, phone, farmSize} from client-side CSV parsing
exports.bulkUploadMembers = async (req, res) => {
    try {
        const { filename, records } = req.body;
        if (!Array.isArray(records) || records.length === 0) {
            return res.status(400).json({ success: false, message: 'No records provided' });
        }

        const cooperative = await Cooperative.findById(req.params.id);
        if (!cooperative) {
            return res.status(404).json({ success: false, message: 'Cooperative not found' });
        }

        const errorLog = [];
        let added = 0;
        records.forEach((record, idx) => {
            if (!record.name || !record.phone) {
                errorLog.push(`Row ${idx + 1}: missing name or phone`);
                return;
            }
            cooperative.members.push({
                name: record.name,
                phone: record.phone,
                farmSize: record.farmSize || 0
            });
            added++;
        });

        cooperative.bulkUploads.push({
            filename: filename || 'upload.csv',
            recordCount: added,
            uploadedBy: req.userId,
            status: errorLog.length ? 'completed' : 'completed',
            errorLog
        });

        await cooperative.save();
        res.status(201).json({
            success: true,
            message: `${added} of ${records.length} records added`,
            errorLog
        });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ success: false, message: 'Bulk upload failed' });
    }
};

exports.getMembers = async (req, res) => {
    try {
        const cooperative = await Cooperative.findById(req.params.id).select('members name');
        if (!cooperative) {
            return res.status(404).json({ success: false, message: 'Cooperative not found' });
        }
        res.json({ success: true, count: cooperative.members.length, members: cooperative.members });
    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch members' });
    }
};
