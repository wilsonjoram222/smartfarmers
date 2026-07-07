const express = require('express');
const router = express.Router();
const cooperativeController = require('../controllers/cooperativeController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public
router.get('/', cooperativeController.getAllCooperatives);
router.get('/:id', cooperativeController.getCooperativeById);
router.get('/:id/members', auth, roleCheck('cooperative', 'admin'), cooperativeController.getMembers);

// Cooperative manager registers their own cooperative
router.post('/', auth, cooperativeController.createCooperative);
router.put('/:id', auth, roleCheck('cooperative', 'admin'), cooperativeController.updateCooperative);
router.post('/:id/members', auth, roleCheck('cooperative', 'admin'), cooperativeController.addMember);
router.post('/:id/members/bulk-upload', auth, roleCheck('cooperative', 'admin'), cooperativeController.bulkUploadMembers);

// Admin-only
router.put('/:id/approval', auth, roleCheck('admin'), cooperativeController.setApproval);

module.exports = router;
