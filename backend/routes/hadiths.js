const express = require('express');
const router = express.Router();
const Hadith = require('../models/Hadith');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/hadiths - Tüm hadisler
router.get('/', protect, async (req, res) => {
    try {
        const hadiths = await Hadith.find({ isActive: true }).sort('number');
        res.json(hadiths);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hadiths/daily - Günün hadisi (gün bazlı döngüsel)
router.get('/daily', protect, async (req, res) => {
    try {
        const count = await Hadith.countDocuments({ isActive: true });
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const index = dayOfYear % count;
        const hadith = await Hadith.findOne({ isActive: true }).skip(index);
        res.json(hadith);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hadiths/:id - Tek hadis
router.get('/:id', protect, async (req, res) => {
    try {
        const hadith = await Hadith.findById(req.params.id);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });
        res.json(hadith);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/hadiths/:id/memorize - Hadisi ezber listesine ekle
router.post('/:id/memorize', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user.memorizedHadiths.includes(req.params.id)) {
            user.memorizedHadiths.push(req.params.id);
            user.points += 20;
            await user.save();
        }
        res.json({ message: 'Hadis ezber listesine eklendi', points: user.points });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/hadiths/:id/memorize - Ezber listesinden çıkar
router.delete('/:id/memorize', protect, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { memorizedHadiths: req.params.id }
        });
        res.json({ message: 'Hadis ezber listesinden çıkarıldı' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
