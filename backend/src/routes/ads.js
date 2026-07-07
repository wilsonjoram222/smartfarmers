const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const AD_ROLES = ['vendor', 'consultant', 'financial', 'delivery', 'cooperative', 'agrodealer', 'transporter', 'regulator', 'integrator'];

// Public landing-page feed — no auth
router.get('/public', adController.getPublicAds);

// Any party role can request/view their own adverts
router.post('/', auth, roleCheck(...AD_ROLES), adController.createAd);
router.get('/mine', auth, roleCheck(...AD_ROLES), adController.getMyAds);
router.post('/:id/pay', auth, roleCheck(...AD_ROLES), adController.initiateAdPayment);

// Admin: review queue, pricing, rejection, deletion
router.get('/', auth, roleCheck('admin'), adController.getAllAds);
router.put('/:id/price', auth, roleCheck('admin'), adController.setPrice);
router.put('/:id/reject', auth, roleCheck('admin'), adController.rejectAd);
router.delete('/:id', auth, roleCheck('admin'), adController.deleteAd);

module.exports = router;
