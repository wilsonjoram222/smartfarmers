const express = require('express');
const router = express.Router();
const regulatorController = require('../controllers/regulatorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Regulator registers their own institution
router.post('/', auth, regulatorController.createRegulator);

// Admin-only
router.get('/', auth, roleCheck('admin'), regulatorController.getAllRegulators);
router.put('/:id/approval', auth, roleCheck('admin'), regulatorController.setApproval);

// Regulator-only, read-only
router.get('/audit-log', auth, roleCheck('regulator'), regulatorController.getAuditLog);

module.exports = router;
