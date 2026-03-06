const express = require('express');
const Promotion = require('../models/Promotion');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all active promotions
router.get('/', async (req, res) => {
    try {
        const currentDate = new Date();
        const filter = {
            isActive: true,
            startDate: { $lte: currentDate },
            $or: [
                { endDate: null },
                { endDate: { $exists: false } },
                { endDate: { $gte: currentDate } }
            ]
        };
        const promotions = await Promotion.find(filter);
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Get all promotions (including inactive)
router.get('/admin', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const promotions = await Promotion.find().sort({ created_at: -1 });
        res.json(promotions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Add promotion
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const promotion = new Promotion(req.body);
        await promotion.save();
        res.status(201).json(promotion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin: Update promotion
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const promotion = await Promotion.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
        res.json(promotion);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin: Delete promotion
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) return res.status(404).json({ message: 'Promotion not found' });
        res.json({ message: 'Promotion deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
