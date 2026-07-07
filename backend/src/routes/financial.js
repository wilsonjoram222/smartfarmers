const express = require('express');
const router = express.Router();
const financialController = require('../controllers/financialController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/', financialController.getAllInstitutions);
router.get('/:id', financialController.getInstitutionById);
router.get('/:id/services', financialController.getServices);
router.post('/:id/feedback', financialController.submitFeedback);

// Bank / MFI / SACCO registers its own institution
router.post('/', auth, financialController.createInstitution);
router.put('/:id', auth, roleCheck('financial', 'admin'), financialController.updateInstitution);
router.post('/:id/services', auth, roleCheck('financial', 'admin'), financialController.addService);
router.get('/:id/feedback', auth, roleCheck('financial', 'admin'), financialController.getFeedbacks);
router.put('/:id/feedback/:feedbackId/respond', auth, roleCheck('financial', 'admin'), financialController.respondToFeedback);

// Admin-only
router.put('/:id/approval', auth, roleCheck('admin'), financialController.setApproval);

module.exports = router;
