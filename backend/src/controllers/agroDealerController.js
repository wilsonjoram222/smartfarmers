const AgroDealer = require('../models/agroDealer');
const Voucher = require('../models/voucher');
const User = require('../models/user');

exports.getAllDealers = async (req, res) => {
    try {
        const filter = req.query.approved !== undefined ? { approved: req.query.approved === 'true' } : {};
        const dealers = await AgroDealer.find(filter).select('-inventory -receipts');
        res.json({ success: true, count: dealers.length, dealers });
    } catch (error) {
        console.error('Get dealers error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch agro-dealers' });
    }
};

exports.getDealerById = async (req, res) => {
    try {
        const dealer = await AgroDealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Agro-dealer not found' });
        }
        res.json({ success: true, dealer });
    } catch (error) {
        console.error('Get dealer error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch agro-dealer' });
    }
};

exports.createDealer = async (req, res) => {
    try {
        const { shopName, ownerName, licenseNumber, phone, email, location } = req.body;
        const dealer = new AgroDealer({
            shopName, ownerName, licenseNumber, phone, email, location,
            userId: req.userId
        });
        await dealer.save();
        await User.findByIdAndUpdate(req.userId, { agroDealerId: dealer._id });
        res.status(201).json({ success: true, message: 'Agro-dealer registered, pending approval', dealer });
    } catch (error) {
        console.error('Create dealer error:', error);
        res.status(500).json({ success: false, message: 'Failed to register agro-dealer' });
    }
};

exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const dealer = await AgroDealer.findByIdAndUpdate(req.params.id, { approved: !!approved }, { new: true });
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Agro-dealer not found' });
        }
        res.json({ success: true, message: `Agro-dealer ${approved ? 'approved' : 'rejected'}`, dealer });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Inventory
exports.addInventoryItem = async (req, res) => {
    try {
        const dealer = await AgroDealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Agro-dealer not found' });
        }
        dealer.inventory.push(req.body);
        await dealer.save();
        res.status(201).json({ success: true, message: 'Inventory item added', inventory: dealer.inventory });
    } catch (error) {
        console.error('Add inventory error:', error);
        res.status(500).json({ success: false, message: 'Failed to add inventory item' });
    }
};

exports.updateStock = async (req, res) => {
    try {
        const { sku, stockLevel } = req.body;
        const dealer = await AgroDealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Agro-dealer not found' });
        }
        const item = dealer.inventory.find(i => i.sku === sku);
        if (!item) {
            return res.status(404).json({ success: false, message: 'SKU not found in inventory' });
        }
        item.stockLevel = stockLevel;
        item.updatedAt = Date.now();
        await dealer.save();
        res.json({ success: true, message: 'Stock updated', item });
    } catch (error) {
        console.error('Update stock error:', error);
        res.status(500).json({ success: false, message: 'Failed to update stock' });
    }
};

// POS sale — optionally redeems a voucher, always emits a digital receipt record
exports.recordSale = async (req, res) => {
    try {
        const { customerPhone, items, voucherCode } = req.body;
        const dealer = await AgroDealer.findById(req.params.id);
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Agro-dealer not found' });
        }

        let total = 0;
        const saleItems = [];
        for (const line of items) {
            const invItem = dealer.inventory.find(i => i.sku === line.sku);
            if (!invItem) {
                return res.status(400).json({ success: false, message: `SKU ${line.sku} not found` });
            }
            if (invItem.stockLevel < line.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${invItem.name}` });
            }
            invItem.stockLevel -= line.quantity;
            const lineTotal = invItem.unitPrice * line.quantity;
            total += lineTotal;
            saleItems.push({ sku: invItem.sku, name: invItem.name, quantity: line.quantity, unitPrice: invItem.unitPrice });
        }

        let voucher = null;
        if (voucherCode) {
            voucher = await Voucher.findOne({ code: voucherCode, status: 'active' });
            if (!voucher) {
                return res.status(400).json({ success: false, message: 'Voucher not found or already used' });
            }
            if (voucher.expiresAt < new Date()) {
                return res.status(400).json({ success: false, message: 'Voucher has expired' });
            }
            if (voucher.value < total) {
                return res.status(400).json({ success: false, message: 'Voucher value insufficient for this sale' });
            }
            voucher.status = 'redeemed';
            voucher.redeemedAt = new Date();
            voucher.redeemedAtDealerId = dealer._id;
            await voucher.save();
        }

        const receiptNumber = `RCT-${Date.now()}`;
        dealer.receipts.push({
            receiptNumber,
            customerPhone,
            items: saleItems,
            total,
            voucherId: voucher ? voucher._id : undefined
        });
        await dealer.save();

        res.status(201).json({
            success: true,
            message: 'Sale recorded',
            receiptNumber,
            total,
            voucherApplied: !!voucher
        });
    } catch (error) {
        console.error('Record sale error:', error);
        res.status(500).json({ success: false, message: 'Failed to record sale' });
    }
};

exports.getReceipts = async (req, res) => {
    try {
        const dealer = await AgroDealer.findById(req.params.id).select('receipts shopName');
        if (!dealer) {
            return res.status(404).json({ success: false, message: 'Agro-dealer not found' });
        }
        res.json({ success: true, count: dealer.receipts.length, receipts: dealer.receipts });
    } catch (error) {
        console.error('Get receipts error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch receipts' });
    }
};

// Vouchers
exports.issueVoucher = async (req, res) => {
    try {
        const { farmerId, value, allowedCategories, expiresAt, issuerType } = req.body;
        const voucher = new Voucher({
            farmerId,
            value,
            allowedCategories,
            expiresAt,
            issuedBy: { type: issuerType || 'admin', refId: req.userId }
        });
        await voucher.save();
        res.status(201).json({ success: true, message: 'Voucher issued', voucher });
    } catch (error) {
        console.error('Issue voucher error:', error);
        res.status(500).json({ success: false, message: 'Failed to issue voucher' });
    }
};

exports.checkVoucher = async (req, res) => {
    try {
        const voucher = await Voucher.findOne({ code: req.params.code });
        if (!voucher) {
            return res.status(404).json({ success: false, message: 'Voucher not found' });
        }
        res.json({ success: true, voucher });
    } catch (error) {
        console.error('Check voucher error:', error);
        res.status(500).json({ success: false, message: 'Failed to check voucher' });
    }
};
