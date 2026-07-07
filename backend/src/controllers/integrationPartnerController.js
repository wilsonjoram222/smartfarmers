const IntegrationPartner = require('../models/integrationPartner');
const IntegrationConfig = require('../models/integrationConfig');

// Admin: list all partner signups (optionally filter by approval status)
exports.getAllPartners = async (req, res) => {
    try {
        const filter = req.query.approved !== undefined ? { approved: req.query.approved === 'true' } : {};
        const partners = await IntegrationPartner.find(filter);
        res.json({ success: true, count: partners.length, partners });
    } catch (error) {
        console.error('Get integration partners error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch integration partners' });
    }
};

exports.getPartnerById = async (req, res) => {
    try {
        const partner = await IntegrationPartner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Integration partner not found' });
        }
        res.json({ success: true, partner });
    } catch (error) {
        console.error('Get integration partner error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch integration partner' });
    }
};

// MNO / fintech integrator registers their own partner profile (mirrors cooperative/regulator/agroDealer signup)
exports.createPartner = async (req, res) => {
    try {
        const { companyName, partnerType, contactPerson, email, phone, country, requestedProviders, useCase } = req.body;
        const partner = new IntegrationPartner({
            companyName, partnerType, contactPerson, email, phone, country, requestedProviders, useCase,
            userId: req.userId
        });
        await partner.save();
        res.status(201).json({ success: true, message: 'Integration partner registered, pending approval', partner });
    } catch (error) {
        console.error('Create integration partner error:', error);
        res.status(500).json({ success: false, message: 'Failed to register integration partner' });
    }
};

exports.updatePartner = async (req, res) => {
    try {
        const { companyName, contactPerson, phone, country, requestedProviders, useCase } = req.body;
        const partner = await IntegrationPartner.findByIdAndUpdate(
            req.params.id,
            { companyName, contactPerson, phone, country, requestedProviders, useCase },
            { new: true, runValidators: true }
        );
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Integration partner not found' });
        }
        res.json({ success: true, message: 'Integration partner updated', partner });
    } catch (error) {
        console.error('Update integration partner error:', error);
        res.status(500).json({ success: false, message: 'Failed to update integration partner' });
    }
};

// Admin: approve/reject a partner signup
exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const partner = await IntegrationPartner.findByIdAndUpdate(req.params.id, { approved: !!approved }, { new: true });
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Integration partner not found' });
        }
        res.json({ success: true, message: `Integration partner ${approved ? 'approved' : 'rejected'}`, partner });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Admin: once a partner is approved, link them to the technical webhook config
// (created separately via POST /api/integrations by an admin, per provider).
exports.linkConfig = async (req, res) => {
    try {
        const { integrationConfigId } = req.body;
        const partner = await IntegrationPartner.findById(req.params.id);
        if (!partner) {
            return res.status(404).json({ success: false, message: 'Integration partner not found' });
        }
        if (!partner.approved) {
            return res.status(400).json({ success: false, message: 'Partner must be approved before linking a config' });
        }
        const config = await IntegrationConfig.findById(integrationConfigId);
        if (!config) {
            return res.status(404).json({ success: false, message: 'Integration config not found' });
        }
        partner.integrationConfigId = config._id;
        await partner.save();
        res.json({ success: true, message: 'Integration partner linked to webhook config', partner });
    } catch (error) {
        console.error('Link config error:', error);
        res.status(500).json({ success: false, message: 'Failed to link integration config' });
    }
};
