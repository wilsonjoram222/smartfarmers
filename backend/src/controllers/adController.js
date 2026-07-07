const Advertisement = require('../models/advertisement');
const MobileMoneyTransaction = require('../models/mobileMoneyTransaction');

const FREE_TRIAL_DAYS = 30;

// Any approved party requests an ad slot. The very first ad a party ever
// requests is auto-activated free for 30 days (no admin pricing needed).
// Every ad after that goes through: pending_review -> admin sets price
// (awaiting_payment) -> party pays -> active.
exports.createAd = async (req, res) => {
    try {
        const { title, description, image, link, placement, durationDays } = req.body;

        if (!req.user.approved) {
            return res.status(403).json({ success: false, message: 'Your account must be approved before you can advertise' });
        }

        const priorCount = await Advertisement.countDocuments({
            ownerId: req.userId,
            status: { $ne: 'rejected' }
        });

        const isFreeTrial = priorCount === 0;

        const ad = new Advertisement({
            ownerId: req.userId,
            ownerRole: req.user.role,
            ownerName: req.user.name,
            title,
            description,
            image,
            link,
            placement: placement || 'landing_sidebar',
            durationDays: isFreeTrial ? FREE_TRIAL_DAYS : (durationDays || 30),
            isFreeTrial
        });

        if (isFreeTrial) {
            ad.price = 0;
            ad.paid = true;
            ad.paidAt = new Date();
            ad.status = 'active';
            ad.startDate = new Date();
            ad.endDate = new Date(Date.now() + FREE_TRIAL_DAYS * 24 * 60 * 60 * 1000);
        }

        await ad.save();

        res.status(201).json({
            success: true,
            message: isFreeTrial
                ? 'Ad live for your free 30-day trial'
                : 'Ad submitted — awaiting admin pricing before it can go live',
            ad
        });
    } catch (error) {
        console.error('Create ad error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit advert' });
    }
};

// Owner's own ads (any status)
exports.getMyAds = async (req, res) => {
    try {
        const ads = await Advertisement.find({ ownerId: req.userId }).sort({ createdAt: -1 });
        res.json({ success: true, count: ads.length, ads });
    } catch (error) {
        console.error('Get my ads error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch your adverts' });
    }
};

// Public landing-page feed — only active, unexpired ads. Lazily flips
// anything that's quietly passed its endDate to 'expired' as it's read,
// since there's no cron/scheduler in this project.
exports.getPublicAds = async (req, res) => {
    try {
        const now = new Date();

        await Advertisement.updateMany(
            { status: 'active', endDate: { $lt: now } },
            { status: 'expired' }
        );

        const filter = { status: 'active', endDate: { $gte: now } };
        if (req.query.placement) filter.placement = req.query.placement;

        const ads = await Advertisement.find(filter)
            .select('-rejectionReason -deletedBy -deletedAt -deletionReason')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: ads.length, ads });
    } catch (error) {
        console.error('Get public ads error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch adverts' });
    }
};

// Admin: full review queue, optional ?status= filter
exports.getAllAds = async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        const ads = await Advertisement.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: ads.length, ads });
    } catch (error) {
        console.error('Get all ads error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch adverts' });
    }
};

// Admin sets the price for the requested duration, moving it to awaiting_payment
exports.setPrice = async (req, res) => {
    try {
        const { price, currency } = req.body;
        if (!price || price <= 0) {
            return res.status(400).json({ success: false, message: 'A positive price is required' });
        }
        const ad = await Advertisement.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Advert not found' });
        }
        if (ad.status !== 'pending_review') {
            return res.status(400).json({ success: false, message: `Cannot price an advert in '${ad.status}' status` });
        }
        ad.price = price;
        if (currency) ad.currency = currency;
        ad.status = 'awaiting_payment';
        await ad.save();
        res.json({ success: true, message: 'Price set, advert awaiting payment', ad });
    } catch (error) {
        console.error('Set ad price error:', error);
        res.status(500).json({ success: false, message: 'Failed to set price' });
    }
};

// Owner initiates payment for a priced ad. This does NOT activate the ad —
// it opens a pending mobile-money collection request. The ad only flips to
// 'active' once the provider's HMAC-verified webhook confirms success
// (see integrationController.receiveWebhook -> cascadeCollectionPayment).
// Note: this creates the pending request on our side; actually pushing an
// STK prompt to the party's phone requires calling out to the MNO's own API,
// which isn't wired up in this project yet (no outbound provider client).
exports.initiateAdPayment = async (req, res) => {
    try {
        const { provider, walletNumber } = req.body;
        if (!provider || !walletNumber) {
            return res.status(400).json({ success: false, message: 'provider and walletNumber are required' });
        }
        const ad = await Advertisement.findById(req.params.id);
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Advert not found' });
        }
        if (String(ad.ownerId) !== String(req.userId)) {
            return res.status(403).json({ success: false, message: 'This advert does not belong to you' });
        }
        if (ad.status !== 'awaiting_payment') {
            return res.status(400).json({ success: false, message: `Advert is not awaiting payment (status: ${ad.status})` });
        }

        const referenceNumber = `AD-${ad._id}-${Date.now()}`;
        await MobileMoneyTransaction.create({
            provider,
            direction: 'collection',
            referenceNumber,
            walletNumber,
            amount: ad.price,
            currency: ad.currency,
            relatedUserId: req.userId,
            status: 'pending',
            purpose: 'ad_payment',
            purposeRefId: ad._id
        });

        res.status(201).json({
            success: true,
            message: 'Payment request created — the advert goes live automatically once the provider confirms payment',
            referenceNumber
        });
    } catch (error) {
        console.error('Initiate ad payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate payment' });
    }
};

exports.rejectAd = async (req, res) => {
    try {
        const { reason } = req.body;
        const ad = await Advertisement.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected', rejectionReason: reason || '' },
            { new: true }
        );
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Advert not found' });
        }
        res.json({ success: true, message: 'Advert rejected', ad });
    } catch (error) {
        console.error('Reject ad error:', error);
        res.status(500).json({ success: false, message: 'Failed to reject advert' });
    }
};

// Admin can pull any advert down at any time, regardless of status or how
// much time/payment is left on it.
exports.deleteAd = async (req, res) => {
    try {
        const { reason } = req.body;
        const ad = await Advertisement.findByIdAndUpdate(
            req.params.id,
            { status: 'deleted', deletedBy: req.userId, deletedAt: new Date(), deletionReason: reason || '' },
            { new: true }
        );
        if (!ad) {
            return res.status(404).json({ success: false, message: 'Advert not found' });
        }
        res.json({ success: true, message: 'Advert removed', ad });
    } catch (error) {
        console.error('Delete ad error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove advert' });
    }
};
