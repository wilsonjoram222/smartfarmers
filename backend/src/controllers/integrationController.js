const IntegrationConfig = require('../models/integrationConfig');
const MobileMoneyTransaction = require('../models/mobileMoneyTransaction');
const IntegrationPartner = require('../models/integrationPartner');
const Advertisement = require('../models/advertisement');
const DigitalResourcePurchase = require('../models/digitalResourcePurchase');
const DigitalResource = require('../models/digitalResource');

// Admin: list configured integrations (secret hash never exposed)
exports.getAllIntegrations = async (req, res) => {
    try {
        const configs = await IntegrationConfig.find().select('-webhookSecretHash');
        res.json({ success: true, count: configs.length, configs });
    } catch (error) {
        console.error('Get integrations error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch integrations' });
    }
};

// Admin: register/update a provider config. rawSecret is provided once and hashed immediately.
exports.upsertIntegration = async (req, res) => {
    try {
        const { provider, displayName, environment, webhookUrl, rawSecret } = req.body;
        if (!rawSecret) {
            return res.status(400).json({ success: false, message: 'rawSecret is required to configure a webhook' });
        }

        const update = {
            displayName,
            environment,
            webhookUrl,
            webhookSecretHash: IntegrationConfig.hashSecret(rawSecret)
        };

        const config = await IntegrationConfig.findOneAndUpdate(
            { provider },
            update,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).select('-webhookSecretHash');

        res.status(201).json({ success: true, message: 'Integration configured', config });
    } catch (error) {
        console.error('Upsert integration error:', error);
        res.status(500).json({ success: false, message: 'Failed to configure integration' });
    }
};

exports.setActive = async (req, res) => {
    try {
        const { isActive } = req.body;
        const config = await IntegrationConfig.findOneAndUpdate(
            { provider: req.params.provider },
            { isActive: !!isActive },
            { new: true }
        ).select('-webhookSecretHash');
        if (!config) {
            return res.status(404).json({ success: false, message: 'Integration not found' });
        }
        res.json({ success: true, message: `Integration ${isActive ? 'enabled' : 'disabled'}`, config });
    } catch (error) {
        console.error('Set active error:', error);
        res.status(500).json({ success: false, message: 'Failed to update integration' });
    }
};

// Inbound webhook receiver — one endpoint per provider, HMAC-verified
// NOTE: rawSecret verification here assumes the raw secret is also available via env var
// (process.env[`${PROVIDER}_WEBHOOK_SECRET`]) since only the hash is persisted in the DB.
exports.receiveWebhook = async (req, res) => {
    try {
        const { provider } = req.params;
        const signature = req.header('X-Signature') || req.header('X-Webhook-Signature');

        const config = await IntegrationConfig.findOne({ provider, isActive: true });
        if (!config) {
            return res.status(404).json({ success: false, message: 'Integration not configured or inactive' });
        }

        const envKey = `${provider.toUpperCase()}_WEBHOOK_SECRET`;
        const rawSecret = process.env[envKey];
        if (!rawSecret) {
            console.error(`Missing ${envKey} — cannot verify webhook signature`);
            return res.status(500).json({ success: false, message: 'Webhook verification not configured' });
        }

        const payloadString = JSON.stringify(req.body);
        const validSignature = config.verifySignature(rawSecret, payloadString, signature);
        if (!validSignature) {
            return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
        }

        const { referenceNumber, direction, walletNumber, amount, currency, status, relatedUserId } = req.body;

        const transaction = await MobileMoneyTransaction.findOneAndUpdate(
            { referenceNumber },
            {
                $set: {
                    provider,
                    direction,
                    walletNumber,
                    amount,
                    currency,
                    status: status || 'success',
                    relatedUserId,
                    rawPayload: req.body,
                    processedAt: new Date()
                }
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        config.lastEventAt = new Date();
        await config.save();

        // Platform-side "collection" payments (ad payments, digital resource
        // purchases) get unlocked ONLY here, once the provider's HMAC-verified
        // webhook confirms success — never from a client-callable endpoint.
        if (transaction.direction === 'collection' && transaction.status === 'success' && transaction.purpose) {
            await cascadeCollectionPayment(transaction);
        }

        const io = req.app.get('io');
        if (io && relatedUserId) {
            io.to(`user_${relatedUserId}`).emit('mobile-money-update', {
                referenceNumber, status: transaction.status, amount
            });
        }

        res.json({ success: true, message: 'Webhook processed' });
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ success: false, message: 'Failed to process webhook' });
    }
};

// Unlocks whatever a confirmed 'collection' payment was for. Idempotent —
// safe to run again if the provider retries the same webhook.
async function cascadeCollectionPayment(transaction) {
    if (transaction.purpose === 'ad_payment') {
        const ad = await Advertisement.findById(transaction.purposeRefId);
        if (ad && ad.status === 'awaiting_payment') {
            ad.paid = true;
            ad.paidAt = new Date();
            ad.status = 'active';
            ad.startDate = new Date();
            ad.endDate = new Date(Date.now() + ad.durationDays * 24 * 60 * 60 * 1000);
            await ad.save();
        }
    } else if (transaction.purpose === 'resource_purchase') {
        const purchase = await DigitalResourcePurchase.findById(transaction.purposeRefId);
        if (purchase && purchase.paymentStatus !== 'paid') {
            purchase.paymentStatus = 'paid';
            purchase.paidAt = new Date();
            purchase.paymentReference = transaction.referenceNumber;
            await purchase.save();
            await DigitalResource.findByIdAndUpdate(purchase.resourceId, { $inc: { purchasesCount: 1 } });
        }
    }
}

exports.getTransactions = async (req, res) => {
    try {
        const filter = {};

        if (req.user.role === 'integrator') {
            // Partners get their own transaction-volume dashboard, but only
            // for the provider they're actually approved and linked to —
            // they can't query someone else's provider or drop the filter.
            const partner = await IntegrationPartner.findOne({ userId: req.userId });
            if (!partner || !partner.approved) {
                return res.status(403).json({ success: false, message: 'Integration partner not approved yet' });
            }
            if (!partner.integrationConfigId) {
                return res.status(400).json({ success: false, message: 'No provider linked to this partner yet' });
            }
            const config = await IntegrationConfig.findById(partner.integrationConfigId);
            if (!config) {
                return res.status(400).json({ success: false, message: 'Linked integration config not found' });
            }
            filter.provider = config.provider;
        } else {
            // Admin / financial keep the unrestricted view
            if (req.query.provider) filter.provider = req.query.provider;
            if (req.query.relatedUserId) filter.relatedUserId = req.query.relatedUserId;
        }

        if (req.query.status) filter.status = req.query.status;

        const transactions = await MobileMoneyTransaction.find(filter)
            .select('-rawPayload')
            .sort({ receivedAt: -1 })
            .limit(200);
        res.json({ success: true, count: transactions.length, transactions });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    }
};
