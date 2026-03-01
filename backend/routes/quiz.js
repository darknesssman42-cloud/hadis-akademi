const express = require('express');
const router = express.Router();
const Hadith = require('../models/Hadith');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Badge = require('../models/Badge');
const { protect } = require('../middleware/auth');

// Quiz sorusu oluşturma - her hadis için 2 soru
async function generateQuestions(hadith, allHadiths) {
    const questions = [];
    const others = allHadiths.filter(h => h._id.toString() !== hadith._id.toString());

    // Soru 1: Türkçe mealinden doğru hadisi bul
    const wrongOptions1 = others
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(h => h.turkish.length > 80 ? h.turkish.substring(0, 80) + '...' : h.turkish);

    const correctAnswer1 = hadith.turkish.length > 80 ? hadith.turkish.substring(0, 80) + '...' : hadith.turkish;
    const options1 = [...wrongOptions1, correctAnswer1].sort(() => Math.random() - 0.5);

    questions.push({
        questionText: `"${hadith.arabic}" hadisinin Türkçe meali hangisidir?`,
        options: options1,
        correctAnswer: correctAnswer1,
        userAnswer: '',
        isCorrect: false
    });

    // Soru 2: Ravisini / kaynağını bul (rastgele seç)
    const questionTypes = ['narrator', 'source', 'topic'];
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];

    let qText, correctAns, wrongOpts;
    if (type === 'narrator') {
        qText = 'Bu hadisi rivayet eden sahabi/alim kimdir?';
        correctAns = hadith.narrator;
        wrongOpts = [...new Set(others.map(h => h.narrator))].sort(() => Math.random() - 0.5).slice(0, 3);
    } else if (type === 'source') {
        qText = 'Bu hadisin kaynağı hangisidir?';
        correctAns = hadith.source;
        wrongOpts = [...new Set(others.map(h => h.source))].sort(() => Math.random() - 0.5).slice(0, 3);
    } else {
        qText = 'Bu hadis hangi konu ile ilgilidir?';
        correctAns = hadith.topic;
        wrongOpts = [...new Set(others.map(h => h.topic))].sort(() => Math.random() - 0.5).slice(0, 3);
    }

    // Eğer wrong options arasında doğru cevap varsa çıkar
    wrongOpts = wrongOpts.filter(o => o !== correctAns).slice(0, 3);
    const options2 = [...wrongOpts, correctAns].sort(() => Math.random() - 0.5);

    questions.push({
        questionText: qText,
        options: options2,
        correctAnswer: correctAns,
        userAnswer: '',
        isCorrect: false
    });

    return questions;
}

// POST /api/quiz/generate - Quiz oluştur (her hadis 2 soru)
router.post('/generate', protect, async (req, res) => {
    try {
        const { hadithId } = req.body;
        if (!hadithId) return res.status(400).json({ error: 'hadithId gerekli' });

        const hadith = await Hadith.findById(hadithId);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });

        const allHadiths = await Hadith.find({ isActive: true });
        const questions = await generateQuestions(hadith, allHadiths);

        res.json({ hadith, questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/quiz/submit - Quiz teslim et
router.post('/submit', protect, async (req, res) => {
    try {
        const { hadithId, answers } = req.body;

        const hadith = await Hadith.findById(hadithId);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });

        const scored = answers.map(a => ({
            ...a,
            isCorrect: a.userAnswer.trim().toLowerCase() === a.correctAnswer.trim().toLowerCase()
        }));

        const score = scored.filter(a => a.isCorrect).length;
        const total = scored.length;

        // 2 soru doğruysa puan kazanılsın (zorluk bazlı)
        let pointsEarned = 0;
        if (score === total) {
            const difficultyPoints = { kolay: 10, orta: 15, zor: 20 };
            pointsEarned = difficultyPoints[hadith.difficulty] || 10;
        }

        const attempt = await QuizAttempt.create({
            user: req.user._id,
            hadith: hadithId,
            quizType: 'multiple_choice',
            questions: scored,
            score,
            totalQuestions: total,
            pointsEarned
        });

        // Kullanıcı puanını güncelle
        const user = await User.findById(req.user._id).populate('badges');
        user.points += pointsEarned;
        user.weeklyPoints = (user.weeklyPoints || 0) + pointsEarned;
        user.totalCorrect += score;
        user.totalAttempted += total;
        await user.save();

        // Rozet kontrolü
        const allBadges = await Badge.find({ 'requirement.type': { $ne: 'weekly_rank' } });
        const newBadges = [];
        for (const badge of allBadges) {
            if (user.badges.some(b => b._id.toString() === badge._id.toString())) continue;
            let earned = false;
            if (badge.requirement.type === 'points' && user.points >= badge.requirement.value) earned = true;
            if (badge.requirement.type === 'memorized' && user.memorizedHadiths.length >= badge.requirement.value) earned = true;
            if (badge.requirement.type === 'correct' && user.totalCorrect >= badge.requirement.value) earned = true;
            if (badge.requirement.type === 'streak' && user.streak >= badge.requirement.value) earned = true;
            if (badge.requirement.type === 'quizzes') {
                const quizCount = await QuizAttempt.countDocuments({ user: req.user._id });
                if (quizCount >= badge.requirement.value) earned = true;
            }
            if (earned) {
                user.badges.push(badge._id);
                newBadges.push(badge);
            }
        }
        await user.save();

        res.json({ attempt, score, total, pointsEarned, newBadges, totalPoints: user.points, allCorrect: score === total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/quiz/daily - Günlük Quiz (Öğretmen tarafından seçilen)
router.get('/daily', protect, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const DailyQuiz = require('../models/DailyQuiz');
        // Retrieve the first daily quiz available for today (assuming 1 global daily quiz or user's teacher class quiz)
        const dailyQuiz = await DailyQuiz.findOne({ date: today, isActive: true })
            .populate('hadiths', 'number arabic turkish topic source narrator difficulty');

        res.json(dailyQuiz || { hadiths: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/quiz/history - Kullanıcı quiz geçmişi
router.get('/history', protect, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.user._id })
            .populate('hadith', 'arabic turkish topic number')
            .sort('-completedAt')
            .limit(30);
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
