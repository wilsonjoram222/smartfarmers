const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const integrationPartnerController = require('../controllers/integrationPartnerController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Admin-only technical config management (webhook URL + secret, per provider)
router.get('/', auth, roleCheck('admin'), integrationController.getAllIntegrations);
router.post('/', auth, roleCheck('admin'), integrationController.upsertIntegration);
router.put('/:provider/active', auth, roleCheck('admin'), integrationController.setActive);
router.get('/transactions', auth, roleCheck('admin', 'financial', 'integrator'), integrationController.getTransactions);

// Inbound webhook — no auth middleware (verified via HMAC signature instead)
router.post('/webhook/:provider', integrationController.receiveWebhook);

// MNO / fintech integrator partner signup — self-service, mirrors the
// cooperative/regulator/agroDealer registration pattern used elsewhere
router.post('/partners', auth, integrationPartnerController.createPartner);
router.put('/partners/:id', auth, roleCheck('integrator', 'admin'), integrationPartnerController.updatePartner);

// Admin-only: review and onboard partner signups
router.get('/partners', auth, roleCheck('admin'), integrationPartnerController.getAllPartners);
router.get('/partners/:id', auth, roleCheck('integrator', 'admin'), integrationPartnerController.getPartnerById);
router.put('/partners/:id/approval', auth, roleCheck('admin'), integrationPartnerController.setApproval);
router.put('/partners/:id/link-config', auth, roleCheck('admin'), integrationPartnerController.linkConfig);

module.exports = router;
