const Category = require('../models/category');

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// Public: list all active categories
exports.getAllCategories = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const categories = await Category.find(filter).sort({ sortOrder: 1, name: 1 });
        res.json({ success: true, count: categories.length, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, category });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch category' });
    }
};

// Admin: create category
exports.createCategory = async (req, res) => {
    try {
        const { name, description, icon, image, parentId, sortOrder } = req.body;
        const existing = await Category.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Category already exists' });
        }
        const category = new Category({
            name,
            slug: toSlug(name),
            description,
            icon,
            image,
            parentId: parentId || null,
            sortOrder: sortOrder || 0
        });
        await category.save();
        res.status(201).json({ success: true, message: 'Category created', category });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ success: false, message: 'Failed to create category' });
    }
};

// Admin: update category
exports.updateCategory = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.name) updates.slug = toSlug(updates.name);

        const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated', category });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ success: false, message: 'Failed to update category' });
    }
};

// Admin: delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete category' });
    }
};
