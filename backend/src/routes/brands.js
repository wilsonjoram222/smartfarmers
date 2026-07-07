const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);

// Admin-only routes
router.post('/', auth, roleCheck('admin'), brandController.createBrand);
router.put('/:id', auth, roleCheck('admin'), brandController.updateBrand);
router.delete('/:id', auth, roleCheck('admin'), brandController.deleteBrand);

module.exports = router;
