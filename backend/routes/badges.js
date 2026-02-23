const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Badge = require('../models/Badge');
const { protect } = require('../middleware/auth');

// GET /api/badges - Tüm rozetler
router.get('/', protect, async (req, res) => {
    try {
        const badges = await Badge.find().sort('requirement.value');
        const user = await User.findById(req.user._id).populate('badges');
        const earnedIds = user.badges.map(b => b._id.toString());
        const result = badges.map(b => ({
            ...b.toObject(),
            earned: earnedIds.includes(b._id.toString())
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
