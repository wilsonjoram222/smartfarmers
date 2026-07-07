const express = require('express');
const router = express.Router();
const transporterController = require('../controllers/transporterController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/', transporterController.getAllTransporters);
router.get('/:id', transporterController.getTransporterById);

// Transporter registers their own company
router.post('/', auth, transporterController.createTransporter);

// Fleet management
router.post('/:id/vehicles', auth, roleCheck('transporter', 'admin'), transporterController.addVehicle);
router.get('/:id/vehicles', auth, roleCheck('transporter', 'admin'), transporterController.getVehicles);

// Waybills
router.post('/:id/waybills', auth, roleCheck('transporter', 'admin'), transporterController.createWaybill);
router.get('/:id/waybills', auth, roleCheck('transporter', 'admin'), transporterController.getWaybills);
router.post('/waybills/:waybillId/transit', auth, roleCheck('transporter', 'delivery', 'admin'), transporterController.logTransitPoint);
router.post('/waybills/:waybillId/confirm-delivery', auth, roleCheck('transporter', 'delivery', 'admin'), transporterController.confirmDelivery);

// Admin-only
router.put('/:id/approval', auth, roleCheck('admin'), transporterController.setApproval);

module.exports = router;
