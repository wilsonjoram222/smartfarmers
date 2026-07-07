const Brand = require('../models/brand');

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.getAllBrands = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const brands = await Brand.find(filter).sort({ name: 1 });
        res.json({ success: true, count: brands.length, brands });
    } catch (error) {
        console.error('Get brands error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brands' });
    }
};

exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        res.json({ success: true, brand });
    } catch (error) {
        console.error('Get brand error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch brand' });
    }
};

exports.createBrand = async (req, res) => {
    try {
        const { name, logo, description } = req.body;
        const existing = await Brand.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Brand already exists' });
        }
        const brand = new Brand({ name, slug: toSlug(name), logo, description });
        await brand.save();
        res.status(201).json({ success: true, message: 'Brand created', brand });
    } catch (error) {
        console.error('Create brand error:', error);
        res.status(500).json({ success: false, message: 'Failed to create brand' });
    }
};

exports.updateBrand = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.name) updates.slug = toSlug(updates.name);

        const brand = await Brand.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        res.json({ success: true, message: 'Brand updated', brand });
    } catch (error) {
        console.error('Update brand error:', error);
        res.status(500).json({ success: false, message: 'Failed to update brand' });
    }
};

exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ success: false, message: 'Brand not found' });
        }
        res.json({ success: true, message: 'Brand deleted' });
    } catch (error) {
        console.error('Delete brand error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete brand' });
    }
};
