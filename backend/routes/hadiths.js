const express = require('express');
const router = express.Router();
const Hadith = require('../models/Hadith');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/hadiths - Tüm hadisler
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 50, topic, difficulty, search } = req.query;
        let query = { isActive: true };

        if (topic) query.topic = topic;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { turkish: { $regex: search, $options: 'i' } },
                { topic: { $regex: search, $options: 'i' } },
                { narrator: { $regex: search, $options: 'i' } },
                { source: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await Hadith.countDocuments(query);
        const hadiths = await Hadith.find(query)
            .sort('number')
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({ hadiths, total, page: parseInt(page), totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hadiths/school-program - Okul Ezber Programı Hadisleri
router.get('/school-program', protect, async (req, res) => {
    try {
        const hadiths = await Hadith.find({ isActive: true, isSchoolProgram: true }).sort('number');
        res.json(hadiths);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hadiths/daily - Günün hadisi (gün bazlı döngüsel)
router.get('/daily', protect, async (req, res) => {
    try {
        const count = await Hadith.countDocuments({ isActive: true });
        if (count === 0) return res.json(null);
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
        const index = dayOfYear % count;
        const hadith = await Hadith.findOne({ isActive: true }).skip(index);
        res.json(hadith);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/hadiths/topics - Benzersiz konu listesi
router.get('/topics', protect, async (req, res) => {
    try {
        const topics = await Hadith.distinct('topic', { isActive: true });
        res.json(topics.sort());
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

// POST /api/hadiths/:id/memorize - Hadisi ezber listesine ekle (doğrulama ile)
router.post('/:id/memorize', protect, async (req, res) => {
    try {
        const { turkishAnswer } = req.body;
        const hadith = await Hadith.findById(req.params.id);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });

        const user = await User.findById(req.user._id);
        if (user.memorizedHadiths.includes(req.params.id)) {
            return res.json({ message: 'Bu hadis zaten ezberlenmiş', already: true, points: user.points });
        }

        // Eğer turkishAnswer gönderildiyse doğrulama yap
        if (turkishAnswer) {
            const normalize = str => str.toLowerCase().replace(/[.,;:'"!?\-()]/g, '').replace(/\s+/g, ' ').trim();
            const answer = normalize(turkishAnswer);
            const correct = normalize(hadith.turkish);

            // Basit benzerlik kontrolü (kelimelerin %60'ı eşleşirse doğru say)
            const answerWords = answer.split(' ');
            const correctWords = correct.split(' ');
            const matchCount = answerWords.filter(w => correctWords.includes(w)).length;
            const similarity = matchCount / correctWords.length;

            if (similarity < 0.5) {
                return res.json({ success: false, message: 'Türkçe meali yeterince doğru değil. Tekrar deneyin.', similarity: Math.round(similarity * 100) });
            }
        }

        // Ezberle ve puan ver
        user.memorizedHadiths.push(req.params.id);
        const difficultyPoints = { kolay: 10, orta: 15, zor: 20 };
        const earned = difficultyPoints[hadith.difficulty] || 10;
        user.points += earned;
        user.weeklyPoints += earned;
        await user.save();

        res.json({ success: true, message: 'Hadis ezber listesine eklendi!', pointsEarned: earned, points: user.points });
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
