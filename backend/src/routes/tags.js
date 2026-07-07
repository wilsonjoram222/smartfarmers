const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Public routes
router.get('/', tagController.getAllTags);
router.get('/:id', tagController.getTagById);

// Admin-only routes
router.post('/', auth, roleCheck('admin'), tagController.createTag);
router.put('/:id', auth, roleCheck('admin'), tagController.updateTag);
router.delete('/:id', auth, roleCheck('admin'), tagController.deleteTag);

module.exports = router;
