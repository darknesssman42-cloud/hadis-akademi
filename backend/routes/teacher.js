const express = require('express');
const router = express.Router();
const User = require('../models/User');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, authorize } = require('../middleware/auth');

// Tüm teacher route'ları öğretmene özel
router.use(protect, authorize('teacher'));

// GET /api/teacher/students - Sınıftaki öğrenciler
router.get('/students', async (req, res) => {
    try {
        const students = await User.find({ role: 'student' })
            .select('name email class points streak memorizedHadiths totalCorrect totalAttempted badges createdAt')
            .populate('badges', 'name icon');

        const result = await Promise.all(students.map(async (s) => {
            const quizCount = await QuizAttempt.countDocuments({ user: s._id });
            return {
                id: s._id,
                name: s.name,
                email: s.email,
                class: s.class,
                points: s.points,
                streak: s.streak,
                memorizedCount: s.memorizedHadiths.length,
                quizCount,
                accuracy: s.totalAttempted > 0 ? Math.round((s.totalCorrect / s.totalAttempted) * 100) : 0,
                badgeCount: s.badges.length,
                joinedAt: s.createdAt
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher/stats - Sınıf genel istatistikleri
router.get('/stats', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalQuizzes = await QuizAttempt.countDocuments();
        const allAttempts = await QuizAttempt.find();
        const avgScore = totalQuizzes > 0
            ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.totalQuestions * 100), 0) / totalQuizzes)
            : 0;

        const topStudent = await User.findOne({ role: 'student' }).sort({ points: -1 }).select('name points');

        res.json({ totalStudents, totalQuizzes, avgScore, topStudent });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
