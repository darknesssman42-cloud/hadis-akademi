const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/leaderboard/weekly - Haftalık sıralama
router.get('/weekly', protect, async (req, res) => {
    try {
        const users = await User.find({ role: 'student' })
            .select('name class school classroom points weeklyPoints streak badges memorizedHadiths')
            .populate('badges', 'icon name')
            .populate('school', 'name')
            .populate('classroom', 'name')
            .sort({ weeklyPoints: -1, points: -1 })
            .limit(50);

        const ranked = users.map((u, i) => ({
            rank: i + 1,
            id: u._id,
            name: u.name,
            class: u.class,
            school: u.school,
            classroom: u.classroom,
            points: u.points,
            weeklyPoints: u.weeklyPoints || 0,
            streak: u.streak,
            badgeCount: u.badges.length,
            memorizedCount: u.memorizedHadiths.length,
            topBadge: u.badges[0] || null,
            isCurrentUser: u._id.toString() === req.user._id.toString()
        }));

        res.json(ranked);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
