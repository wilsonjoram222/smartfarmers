const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin-only routes
router.post('/', auth, roleCheck('admin'), categoryController.createCategory);
router.put('/:id', auth, roleCheck('admin'), categoryController.updateCategory);
router.delete('/:id', auth, roleCheck('admin'), categoryController.deleteCategory);

module.exports = router;
