const express = require('express');
const router = express.Router();
const controller = require('../controllers/digitalResourceController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadPrivatePDF } = require('../middleware/upload');

const SELLER_ROLES = ['consultant', 'financial', 'cooperative', 'agrodealer', 'transporter', 'regulator', 'integrator'];

// Public storefront
router.get('/public', controller.getPublicResources);
router.get('/public/:id', controller.getResourceById);

// Sellers
router.post('/', auth, roleCheck(...SELLER_ROLES), uploadPrivatePDF('file'), controller.uploadResource);
router.get('/mine', auth, roleCheck(...SELLER_ROLES), controller.getMyResources);

// Customers
router.post('/:id/purchase', auth, roleCheck('customer'), controller.purchaseResource);
router.post('/purchases/:id/pay', auth, roleCheck('customer'), controller.initiatePurchasePayment);
router.get('/purchases/mine', auth, roleCheck('customer'), controller.getMyPurchases);
router.get('/:id/download', auth, roleCheck('customer'), controller.downloadResource);

// Admin
router.get('/', auth, roleCheck('admin'), controller.getAllResources);
router.put('/:id/approval', auth, roleCheck('admin'), controller.setApproval);

module.exports = router;
