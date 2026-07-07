const FinancialInstitution = require('../models/financialInstitution');
const User = require('../models/user');

exports.getAllInstitutions = async (req, res) => {
    try {
        const filter = req.query.approved !== undefined ? { approved: req.query.approved === 'true' } : {};
        const institutions = await FinancialInstitution.find(filter).select('-feedbacks');
        res.json({ success: true, count: institutions.length, institutions });
    } catch (error) {
        console.error('Get financial institutions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch financial institutions' });
    }
};

exports.getInstitutionById = async (req, res) => {
    try {
        const institution = await FinancialInstitution.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        res.json({ success: true, institution });
    } catch (error) {
        console.error('Get financial institution error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch financial institution' });
    }
};

// Bank / MFI / SACCO registers its own institution profile
exports.createInstitution = async (req, res) => {
    try {
        const { name, type, email, phone } = req.body;
        const institution = new FinancialInstitution({
            name, type, email, phone,
            userId: req.userId
        });
        await institution.save();
        await User.findByIdAndUpdate(req.userId, { financialId: institution._id });
        res.status(201).json({ success: true, message: 'Financial institution registered, pending approval', institution });
    } catch (error) {
        console.error('Create financial institution error:', error);
        res.status(500).json({ success: false, message: 'Failed to register financial institution' });
    }
};

exports.updateInstitution = async (req, res) => {
    try {
        const { name, type, phone, isActive } = req.body;
        const institution = await FinancialInstitution.findByIdAndUpdate(
            req.params.id,
            { name, type, phone, isActive },
            { new: true, runValidators: true }
        );
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        res.json({ success: true, message: 'Financial institution updated', institution });
    } catch (error) {
        console.error('Update financial institution error:', error);
        res.status(500).json({ success: false, message: 'Failed to update financial institution' });
    }
};

// Admin: approve/reject institution
exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const institution = await FinancialInstitution.findByIdAndUpdate(req.params.id, { approved: !!approved }, { new: true });
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        res.json({ success: true, message: `Financial institution ${approved ? 'approved' : 'rejected'}`, institution });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Services (loan products, credit lines, etc.)
exports.addService = async (req, res) => {
    try {
        const { title, description, rate } = req.body;
        const institution = await FinancialInstitution.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        institution.services.push({ title, description, rate });
        await institution.save();
        res.status(201).json({ success: true, message: 'Service added', services: institution.services });
    } catch (error) {
        console.error('Add service error:', error);
        res.status(500).json({ success: false, message: 'Failed to add service' });
    }
};

exports.getServices = async (req, res) => {
    try {
        const institution = await FinancialInstitution.findById(req.params.id).select('services name');
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        res.json({ success: true, count: institution.services.length, services: institution.services });
    } catch (error) {
        console.error('Get services error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch services' });
    }
};

// Customer inquiries / feedback
exports.submitFeedback = async (req, res) => {
    try {
        const { customerName, customerEmail, inquiryType, description } = req.body;
        const institution = await FinancialInstitution.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        institution.feedbacks.push({ customerName, customerEmail, inquiryType, description });
        await institution.save();
        res.status(201).json({ success: true, message: 'Inquiry submitted' });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit inquiry' });
    }
};

exports.getFeedbacks = async (req, res) => {
    try {
        const institution = await FinancialInstitution.findById(req.params.id).select('feedbacks name');
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        res.json({ success: true, count: institution.feedbacks.length, feedbacks: institution.feedbacks });
    } catch (error) {
        console.error('Get feedbacks error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch inquiries' });
    }
};

exports.respondToFeedback = async (req, res) => {
    try {
        const { response } = req.body;
        const institution = await FinancialInstitution.findById(req.params.id);
        if (!institution) {
            return res.status(404).json({ success: false, message: 'Financial institution not found' });
        }
        const feedback = institution.feedbacks.id(req.params.feedbackId);
        if (!feedback) {
            return res.status(404).json({ success: false, message: 'Inquiry not found' });
        }
        feedback.response = response;
        feedback.status = 'responded';
        feedback.respondedAt = new Date();
        await institution.save();
        res.json({ success: true, message: 'Response recorded', feedback });
    } catch (error) {
        console.error('Respond to feedback error:', error);
        res.status(500).json({ success: false, message: 'Failed to record response' });
    }
};
