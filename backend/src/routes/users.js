const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Protected routes
router.get('/', auth, roleCheck('admin'), userController.getAllUsers);
router.get('/:id', auth, userController.getUserById);
router.put('/profile', auth, userController.updateProfile);
router.put('/:id/approval', auth, roleCheck('admin'), userController.setApproval);
router.delete('/:id', auth, roleCheck('admin'), userController.deleteUser);

module.exports = router;
