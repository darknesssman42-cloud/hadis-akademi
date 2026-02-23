const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const { protect } = require('../middleware/auth');

// GET /api/progress/me - Kişisel ilerleme
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('memorizedHadiths', 'topic number').populate('badges');
        const attempts = await QuizAttempt.find({ user: req.user._id }).sort('completedAt');

        // Günlük başarı oranı (son 7 gün)
        const weeklyData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));
            const dayAttempts = attempts.filter(a => a.completedAt >= start && a.completedAt <= end);
            weeklyData.push({
                date: start.toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric' }),
                quizzes: dayAttempts.length,
                correct: dayAttempts.reduce((s, a) => s + a.score, 0),
                total: dayAttempts.reduce((s, a) => s + a.totalQuestions, 0)
            });
        }

        res.json({
            user: {
                name: user.name, points: user.points, streak: user.streak,
                badges: user.badges, memorizedHadiths: user.memorizedHadiths,
                totalCorrect: user.totalCorrect, totalAttempted: user.totalAttempted,
                accuracy: user.totalAttempted > 0 ? Math.round((user.totalCorrect / user.totalAttempted) * 100) : 0
            },
            weeklyData,
            totalQuizzes: attempts.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
