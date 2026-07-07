const Transporter = require('../models/transporter');
const Waybill = require('../models/waybill');
const User = require('../models/user');

exports.getAllTransporters = async (req, res) => {
    try {
        const filter = req.query.approved !== undefined ? { approved: req.query.approved === 'true' } : {};
        const transporters = await Transporter.find(filter);
        res.json({ success: true, count: transporters.length, transporters });
    } catch (error) {
        console.error('Get transporters error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transporters' });
    }
};

exports.getTransporterById = async (req, res) => {
    try {
        const transporter = await Transporter.findById(req.params.id);
        if (!transporter) {
            return res.status(404).json({ success: false, message: 'Transporter not found' });
        }
        res.json({ success: true, transporter });
    } catch (error) {
        console.error('Get transporter error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transporter' });
    }
};

exports.createTransporter = async (req, res) => {
    try {
        const { companyName, licenseNumber, contactPerson, phone, email, region } = req.body;
        const transporter = new Transporter({
            companyName, licenseNumber, contactPerson, phone, email, region,
            userId: req.userId
        });
        await transporter.save();
        await User.findByIdAndUpdate(req.userId, { transporterId: transporter._id });
        res.status(201).json({ success: true, message: 'Transporter registered, pending approval', transporter });
    } catch (error) {
        console.error('Create transporter error:', error);
        res.status(500).json({ success: false, message: 'Failed to register transporter' });
    }
};

exports.setApproval = async (req, res) => {
    try {
        const { approved } = req.body;
        const transporter = await Transporter.findByIdAndUpdate(req.params.id, { approved: !!approved }, { new: true });
        if (!transporter) {
            return res.status(404).json({ success: false, message: 'Transporter not found' });
        }
        res.json({ success: true, message: `Transporter ${approved ? 'approved' : 'rejected'}`, transporter });
    } catch (error) {
        console.error('Set approval error:', error);
        res.status(500).json({ success: false, message: 'Failed to update approval status' });
    }
};

// Fleet management
exports.addVehicle = async (req, res) => {
    try {
        const transporter = await Transporter.findById(req.params.id);
        if (!transporter) {
            return res.status(404).json({ success: false, message: 'Transporter not found' });
        }
        transporter.vehicles.push(req.body);
        await transporter.save();
        res.status(201).json({ success: true, message: 'Vehicle added', vehicles: transporter.vehicles });
    } catch (error) {
        console.error('Add vehicle error:', error);
        res.status(500).json({ success: false, message: 'Failed to add vehicle' });
    }
};

exports.getVehicles = async (req, res) => {
    try {
        const transporter = await Transporter.findById(req.params.id).select('vehicles companyName');
        if (!transporter) {
            return res.status(404).json({ success: false, message: 'Transporter not found' });
        }
        res.json({ success: true, count: transporter.vehicles.length, vehicles: transporter.vehicles });
    } catch (error) {
        console.error('Get vehicles error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch vehicles' });
    }
};

// Waybills
exports.createWaybill = async (req, res) => {
    try {
        const { vehiclePlateNumber, orderId, cargo, pickupPoint, dropoffPoint } = req.body;
        const waybill = new Waybill({
            transporterId: req.params.id,
            vehiclePlateNumber, orderId, cargo, pickupPoint, dropoffPoint
        });
        await waybill.save();
        res.status(201).json({ success: true, message: 'Waybill created', waybill });
    } catch (error) {
        console.error('Create waybill error:', error);
        res.status(500).json({ success: false, message: 'Failed to create waybill' });
    }
};

exports.getWaybills = async (req, res) => {
    try {
        const filter = { transporterId: req.params.id };
        if (req.query.status) filter.status = req.query.status;
        const waybills = await Waybill.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: waybills.length, waybills });
    } catch (error) {
        console.error('Get waybills error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch waybills' });
    }
};

// Append a GPS transit point (called periodically by the driver's mobile app)
exports.logTransitPoint = async (req, res) => {
    try {
        const { lat, lng } = req.body;
        const waybill = await Waybill.findById(req.params.waybillId);
        if (!waybill) {
            return res.status(404).json({ success: false, message: 'Waybill not found' });
        }
        waybill.transitLog.push({ lat, lng });
        if (waybill.status === 'created') waybill.status = 'in_transit';
        await waybill.save();

        const io = req.app.get('io');
        if (io) io.to('admin_room').emit('waybill-location', { waybillId: waybill._id, lat, lng });

        res.json({ success: true, message: 'Transit point logged' });
    } catch (error) {
        console.error('Log transit point error:', error);
        res.status(500).json({ success: false, message: 'Failed to log transit point' });
    }
};

// Confirm proof of delivery
exports.confirmDelivery = async (req, res) => {
    try {
        const { method, pinCode, signatureImage, photoUrl } = req.body;
        const waybill = await Waybill.findById(req.params.waybillId);
        if (!waybill) {
            return res.status(404).json({ success: false, message: 'Waybill not found' });
        }
        waybill.proofOfDelivery = { method, pinCode, signatureImage, photoUrl, confirmedAt: new Date() };
        waybill.status = 'delivered';
        waybill.deliveredAt = new Date();
        await waybill.save();
        res.json({ success: true, message: 'Delivery confirmed', waybill });
    } catch (error) {
        console.error('Confirm delivery error:', error);
        res.status(500).json({ success: false, message: 'Failed to confirm delivery' });
    }
};
