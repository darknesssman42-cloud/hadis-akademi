const express = require('express');
const router = express.Router();
const Hadith = require('../models/Hadith');
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const Badge = require('../models/Badge');
const { protect } = require('../middleware/auth');

// Quiz sorusu oluşturma yardımcısı
async function generateQuestions(hadith, type, allHadiths) {
    const questions = [];

    if (type === 'multiple_choice') {
        // Türkçe mealinden Arapça'yı bul
        const wrongOptions = allHadiths
            .filter(h => h._id.toString() !== hadith._id.toString())
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(h => h.turkish.substring(0, 80) + '...');

        const correctAnswer = hadith.turkish.substring(0, 80) + '...';
        const options = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);

        questions.push({
            questionText: `"${hadith.arabic}" hadisinin Türkçe meali hangisidir?`,
            options,
            correctAnswer,
            userAnswer: '',
            isCorrect: false
        });

        // Kaynağını bul
        const sourceOptions = allHadiths
            .filter(h => h._id.toString() !== hadith._id.toString())
            .slice(0, 3)
            .map(h => h.source);
        sourceOptions.push(hadith.source);
        questions.push({
            questionText: 'Bu hadisin kaynağı (ravisi/kitabı) hangisidir?',
            options: [...new Set(sourceOptions)].sort(() => Math.random() - 0.5),
            correctAnswer: hadith.source,
            userAnswer: '',
            isCorrect: false
        });
    }

    if (type === 'fill_blank') {
        const words = hadith.turkish.split(' ');
        const blankIndex = Math.floor(words.length / 2);
        const missing = words[blankIndex];
        const filled = [...words];
        filled[blankIndex] = '_____';
        questions.push({
            questionText: `Boşluğu doldurun: "${filled.join(' ')}"`,
            options: [],
            correctAnswer: missing,
            userAnswer: '',
            isCorrect: false
        });

        // Narrator fill blank
        const narratorWords = hadith.narrator.split(' ');
        questions.push({
            questionText: `Bu hadisi rivayet eden sahabi/alimin adı nedir? (İpucu: ${narratorWords[0][0]}...)`,
            options: [],
            correctAnswer: hadith.narrator,
            userAnswer: '',
            isCorrect: false
        });
    }

    if (type === 'matching') {
        // 3 hadis eşleştir: Arapça ↔ Türkçe
        const sample = [hadith, ...allHadiths.filter(h => h._id.toString() !== hadith._id.toString())
            .sort(() => Math.random() - 0.5).slice(0, 2)];
        sample.forEach(h => {
            questions.push({
                questionText: `Eşleştir: "${h.arabic.substring(0, 60)}..."`,
                options: [],
                correctAnswer: h.turkish.substring(0, 80) + '...',
                userAnswer: '',
                isCorrect: false
            });
        });
    }

    return questions;
}

// POST /api/quiz/generate - Quiz oluştur
router.post('/generate', protect, async (req, res) => {
    try {
        const { hadithId, quizType } = req.body;
        if (!hadithId || !quizType) return res.status(400).json({ error: 'hadithId ve quizType gerekli' });

        const hadith = await Hadith.findById(hadithId);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });

        const allHadiths = await Hadith.find({ isActive: true, _id: { $ne: hadithId } });
        const questions = await generateQuestions(hadith, quizType, allHadiths);

        res.json({ hadith, quizType, questions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/quiz/submit - Quiz teslim et
router.post('/submit', protect, async (req, res) => {
    try {
        const { hadithId, quizType, answers } = req.body;
        // answers: [{questionText, correctAnswer, userAnswer}]

        const scored = answers.map(a => ({
            ...a,
            isCorrect: a.userAnswer.trim().toLowerCase() === a.correctAnswer.trim().toLowerCase()
        }));

        const score = scored.filter(a => a.isCorrect).length;
        const total = scored.length;
        const pointsEarned = score * 10;

        const attempt = await QuizAttempt.create({
            user: req.user._id,
            hadith: hadithId,
            quizType,
            questions: scored,
            score,
            totalQuestions: total,
            pointsEarned
        });

        // Kullanıcı puanını güncelle
        const user = await User.findById(req.user._id).populate('badges');
        user.points += pointsEarned;
        user.totalCorrect += score;
        user.totalAttempted += total;
        await user.save();

        // Rozet kontrolü
        const allBadges = await Badge.find();
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

        res.json({ attempt, score, total, pointsEarned, newBadges, totalPoints: user.points });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/quiz/history - Kullanıcı quiz geçmişi
router.get('/history', protect, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.user._id })
            .populate('hadith', 'arabic turkish topic')
            .sort('-completedAt')
            .limit(20);
        res.json(attempts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
