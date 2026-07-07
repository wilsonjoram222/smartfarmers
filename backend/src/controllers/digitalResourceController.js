const path = require('path');
const fs = require('fs');
const DigitalResource = require('../models/digitalResource');
const DigitalResourcePurchase = require('../models/digitalResourcePurchase');
const MobileMoneyTransaction = require('../models/mobileMoneyTransaction');
const { privateResourceDir } = require('../middleware/upload');

// Consultant / financial institution / other approved party uploads a PDF
// for sale. Goes to 'pending' for admin review before it's listed, same
// approval pattern used for cooperative/agrodealer/etc signups.
exports.uploadResource = async (req, res) => {
    try {
        if (!req.user.approved) {
            return res.status(403).json({ success: false, message: 'Your account must be approved before you can sell resources' });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'A PDF file is required' });
        }

        const { title, description, category, price, currency, coverImage } = req.body;
        if (!price || Number(price) <= 0) {
            return res.status(400).json({ success: false, message: 'A positive price is required' });
        }

        const resource = new DigitalResource({
            title,
            description,
            category,
            price: Number(price),
            currency: currency || 'UGX',
            coverImage,
            storedFilename: req.file.filename,
            originalFilename: req.file.originalname,
            ownerId: req.userId,
            ownerRole: req.user.role,
            ownerName: req.user.name
        });
        await resource.save();

        res.status(201).json({ success: true, message: 'Resource uploaded, pending approval', resource: sanitize(resource) });
    } catch (error) {
        console.error('Upload resource error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload resource' });
    }
};

// Public storefront listing — metadata only, file path never exposed
exports.getPublicResources = async (req, res) => {
    try {
        const filter = { status: 'active' };
        if (req.query.category) filter.category = req.query.category;
        const resources = await DigitalResource.find(filter)
            .select('-storedFilename')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: resources.length, resources });
    } catch (error) {
        console.error('Get public resources error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch resources' });
    }
};

exports.getResourceById = async (req, res) => {
    try {
        const resource = await DigitalResource.findById(req.params.id).select('-storedFilename');
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        res.json({ success: true, resource });
    } catch (error) {
        console.error('Get resource error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch resource' });
    }
};

exports.getMyResources = async (req, res) => {
    try {
        const resources = await DigitalResource.find({ ownerId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, count: resources.length, resources });
    } catch (error) {
        console.error('Get my resources error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your resources' });
    }
};

// Admin: full review queue
exports.getAllResources = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const resources = await DigitalResource.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: resources.length, resources });
    } catch (error) {
        console.error('Get all resources error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch resources' });
    }
};

exports.setApproval = async (req, res) => {
    try {
        const { approved, reason } = req.body;
        const resource = await DigitalResource.findByIdAndUpdate(
            req.params.id,
            approved ? { status: 'active' } : { status: 'rejected', rejectionReason: reason || '' },
            { new: true }
        ).select('-storedFilename');
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }
        res.json({ success: true, message: `Resource ${approved ? 'approved' : 'rejected'}`, resource });
    } catch (error) {
        console.error('Set resource approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update resource' });
    }
};

// Customer initiates purchase — creates a pending purchase record
exports.purchaseResource = async (req, res) => {
    try {
        const resource = await DigitalResource.findById(req.params.id);
        if (!resource || resource.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Resource not available for purchase' });
        }

        const purchase = new DigitalResourcePurchase({
            resourceId: resource._id,
            buyerId: req.userId,
            amount: resource.price,
            currency: resource.currency
        });
        await purchase.save();

        res.status(201).json({ success: true, message: 'Purchase created, complete payment to unlock download', purchase });
    } catch (error) {
        console.error('Purchase resource error:', error);
        res.status(500).json({ success: false, message: 'Failed to start purchase' });
    }
};

// Opens a pending mobile-money collection request for a purchase. Does NOT
// unlock the download — that only happens once the provider's HMAC-verified
// webhook confirms success (see integrationController.receiveWebhook ->
// cascadeCollectionPayment). Same caveat as ad payments: actually pushing an
// STK prompt to the buyer's phone needs an outbound call to the MNO's API,
// which this project doesn't have wired up yet.
exports.initiatePurchasePayment = async (req, res) => {
    try {
        const { provider, walletNumber } = req.body;
        if (!provider || !walletNumber) {
            return res.status(400).json({ success: false, message: 'provider and walletNumber are required' });
        }
        const purchase = await DigitalResourcePurchase.findById(req.params.id);
        if (!purchase) {
            return res.status(404).json({ success: false, message: 'Purchase not found' });
        }
        if (String(purchase.buyerId) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: 'This purchase does not belong to you' });
        }
        if (purchase.paymentStatus === 'paid') {
            return res.status(400).json({ success: false, message: 'Already paid' });
        }

        const referenceNumber = `RES-${purchase._id}-${Date.now()}`;
        await MobileMoneyTransaction.create({
            provider,
            direction: 'collection',
            referenceNumber,
            walletNumber,
            amount: purchase.amount,
            currency: purchase.currency,
            relatedUserId: req.userId,
            status: 'pending',
            purpose: 'resource_purchase',
            purposeRefId: purchase._id
        });

        purchase.paymentReference = referenceNumber;
        await purchase.save();

        res.status(201).json({
            success: true,
            message: 'Payment request created — the download unlocks automatically once the provider confirms payment',
            referenceNumber
        });
    } catch (error) {
        console.error('Initiate purchase payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate payment' });
    }
};

exports.getMyPurchases = async (req, res) => {
    try {
        const purchases = await DigitalResourcePurchase.find({ buyerId: req.userId })
            .populate('resourceId', 'title coverImage category')
            .sort({ purchasedAt: -1 });
        res.json({ success: true, count: purchases.length, purchases });
    } catch (error) {
        console.error('Get my purchases error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch purchases' });
    }
};

// Download — only served after a verified, paid purchase. File lives outside
// the publicly-served /uploads folder so this is the only path to it.
exports.downloadResource = async (req, res) => {
    try {
        const purchase = await DigitalResourcePurchase.findOne({
            resourceId: req.params.id,
            buyerId: req.userId,
            paymentStatus: 'paid'
        });
        if (!purchase) {
            return res.status(403).json({ success: false, message: 'Purchase and payment required before download' });
        }

        const resource = await DigitalResource.findById(req.params.id);
        if (!resource) {
            return res.status(404).json({ success: false, message: 'Resource not found' });
        }

        const filePath = path.join(privateResourceDir, resource.storedFilename);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'File missing on server' });
        }

        purchase.downloadsUsed += 1;
        await purchase.save();
        await DigitalResource.findByIdAndUpdate(resource._id, { $inc: { downloadsCount: 1 } });

        res.download(filePath, resource.originalFilename || `${resource.title}.pdf`);
    } catch (error) {
        console.error('Download resource error:', error);
        res.status(500).json({ success: false, message: 'Failed to download resource' });
    }
};

function sanitize(resource) {
    const obj = resource.toObject();
    delete obj.storedFilename;
    return obj;
}
