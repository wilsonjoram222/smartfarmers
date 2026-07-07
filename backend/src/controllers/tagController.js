const Tag = require('../models/tag');

const toSlug = (str) => str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

exports.getAllTags = async (req, res) => {
    try {
        const filter = req.query.all === 'true' ? {} : { isActive: true };
        const tags = await Tag.find(filter).sort({ name: 1 });
        res.json({ success: true, count: tags.length, tags });
    } catch (error) {
        console.error('Get tags error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tags' });
    }
};

exports.getTagById = async (req, res) => {
    try {
        const tag = await Tag.findById(req.params.id);
        if (!tag) {
            return res.status(404).json({ success: false, message: 'Tag not found' });
        }
        res.json({ success: true, tag });
    } catch (error) {
        console.error('Get tag error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch tag' });
    }
};

exports.createTag = async (req, res) => {
    try {
        const { name, description } = req.body;
        const existing = await Tag.findOne({ name });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Tag already exists' });
        }
        const tag = new Tag({ name, slug: toSlug(name), description });
        await tag.save();
        res.status(201).json({ success: true, message: 'Tag created', tag });
    } catch (error) {
        console.error('Create tag error:', error);
        res.status(500).json({ success: false, message: 'Failed to create tag' });
    }
};

exports.updateTag = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.name) updates.slug = toSlug(updates.name);

        const tag = await Tag.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!tag) {
            return res.status(404).json({ success: false, message: 'Tag not found' });
        }
        res.json({ success: true, message: 'Tag updated', tag });
    } catch (error) {
        console.error('Update tag error:', error);
        res.status(500).json({ success: false, message: 'Failed to update tag' });
    }
};

exports.deleteTag = async (req, res) => {
    try {
        const tag = await Tag.findByIdAndDelete(req.params.id);
        if (!tag) {
            return res.status(404).json({ success: false, message: 'Tag not found' });
        }
        res.json({ success: true, message: 'Tag deleted' });
    } catch (error) {
        console.error('Delete tag error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete tag' });
    }
};
