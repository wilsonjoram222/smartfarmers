const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

router.post('/', auth, roleCheck('vendor', 'delivery'), withdrawalController.requestWithdrawal);
router.get('/mine', auth, roleCheck('vendor', 'delivery'), withdrawalController.getMyWithdrawals);

router.get('/', auth, roleCheck('admin'), withdrawalController.getAllWithdrawals);
router.put('/:id/status', auth, roleCheck('admin'), withdrawalController.setWithdrawalStatus);

module.exports = router;
