const express = require('express');
const router = express.Router();
const agroDealerController = require('../controllers/agroDealerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/', agroDealerController.getAllDealers);
router.get('/:id', agroDealerController.getDealerById);
router.get('/voucher/:code', agroDealerController.checkVoucher);

// Dealer registers themselves
router.post('/', auth, agroDealerController.createDealer);

// Dealer-only (POS)
router.post('/:id/inventory', auth, roleCheck('agrodealer', 'admin'), agroDealerController.addInventoryItem);
router.put('/:id/inventory/stock', auth, roleCheck('agrodealer', 'admin'), agroDealerController.updateStock);
router.post('/:id/sales', auth, roleCheck('agrodealer', 'admin'), agroDealerController.recordSale);
router.get('/:id/receipts', auth, roleCheck('agrodealer', 'admin'), agroDealerController.getReceipts);

// Voucher issuance — financial institutions, cooperatives, or admin
router.post('/vouchers/issue', auth, roleCheck('financial', 'cooperative', 'admin'), agroDealerController.issueVoucher);

// Admin-only
router.put('/:id/approval', auth, roleCheck('admin'), agroDealerController.setApproval);

module.exports = router;
