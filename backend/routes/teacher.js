const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hadith = require('../models/Hadith');
const QuizAttempt = require('../models/QuizAttempt');
const DailyQuiz = require('../models/DailyQuiz');
const { protect, authorize } = require('../middleware/auth');

// Tüm teacher route'ları öğretmene özel
router.use(protect, authorize('teacher', 'admin'));

// GET /api/teacher/students — Tüm öğrenciler
router.get('/students', async (req, res) => {
    try {
        const { search, classFilter } = req.query;
        let query = { role: 'student' };

        if (classFilter) query.classroom = classFilter;

        let students = await User.find(query)
            .select('name email class school classroom points streak memorizedHadiths assignedHadiths totalCorrect totalAttempted badges schoolNumber createdAt')
            .populate('badges', 'name icon')
            .populate('school', 'name')
            .populate('classroom', 'name')
            .populate('memorizedHadiths', 'number arabic turkish topic difficulty')
            .populate('assignedHadiths', 'number arabic turkish topic difficulty');

        // Arama filtresi (Backend tarafında da yapılabilir ama frontend'de filtreleniyor genelde)
        let filtered = students;
        if (search) {
            const s = search.toLowerCase();
            filtered = students.filter(st =>
                st.name.toLowerCase().includes(s) ||
                (st.classroom?.name || '').toLowerCase().includes(s) ||
                (st.school?.name || '').toLowerCase().includes(s) ||
                (st.schoolNumber || '').toLowerCase().includes(s) ||
                st.email.toLowerCase().includes(s)
            );
        }

        const result = await Promise.all(filtered.map(async (s) => {
            const quizCount = await QuizAttempt.countDocuments({ user: s._id });
            return {
                id: s._id,
                name: s.name,
                email: s.email,
                class: s.class, // Legacy
                school: s.school ? { id: s.school._id, name: s.school.name } : null,
                classroom: s.classroom ? { id: s.classroom._id, name: s.classroom.name } : null,
                schoolNumber: s.schoolNumber,
                points: s.points,
                streak: s.streak,
                memorizedCount: s.memorizedHadiths.length,
                memorizedHadiths: s.memorizedHadiths,
                assignedHadiths: s.assignedHadiths,
                assignedCount: s.assignedHadiths.length,
                quizCount,
                accuracy: s.totalAttempted > 0 ? Math.round((s.totalCorrect / s.totalAttempted) * 100) : 0,
                badgeCount: s.badges.length,
                badges: s.badges,
                joinedAt: s.createdAt
            };
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher/stats — Sınıf genel istatistikleri
router.get('/stats', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalQuizzes = await QuizAttempt.countDocuments();
        const allAttempts = await QuizAttempt.find();
        const avgScore = totalQuizzes > 0
            ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.totalQuestions * 100), 0) / totalQuizzes)
            : 0;

        const topStudent = await User.findOne({ role: 'student' }).sort({ points: -1 }).select('name points class');

        // Toplam ezberlenen
        const allStudents = await User.find({ role: 'student' });
        const totalMemorized = allStudents.reduce((s, st) => s + st.memorizedHadiths.length, 0);

        res.json({ totalStudents, totalQuizzes, avgScore, topStudent, totalMemorized });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher/student/:id/memorized — Öğrencinin ezberlediği hadisler
router.get('/student/:id/memorized', async (req, res) => {
    try {
        const student = await User.findById(req.params.id)
            .populate('memorizedHadiths', 'number arabic turkish topic source narrator difficulty');
        if (!student) return res.status(404).json({ error: 'Öğrenci bulunamadı' });
        res.json({ name: student.name, memorizedHadiths: student.memorizedHadiths });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/teacher/student/:id/memorize — Öğretmenin öğrenci için ezber eklemesi
router.post('/student/:id/memorize', async (req, res) => {
    try {
        const { hadithId } = req.body;
        if (!hadithId) return res.status(400).json({ error: 'hadithId gerekli' });

        const student = await User.findById(req.params.id);
        if (!student || student.role !== 'student') return res.status(404).json({ error: 'Öğrenci bulunamadı' });

        const hadith = await Hadith.findById(hadithId);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });

        if (student.memorizedHadiths.includes(hadithId)) {
            return res.status(400).json({ error: 'Bu hadis zaten ezberlendi olarak işaretlenmiş' });
        }

        student.memorizedHadiths.push(hadithId);

        // Puan kazandır (zorluğa göre)
        let pointsEarned = 15;
        if (hadith.difficulty === 'kolay') pointsEarned = 10;
        else if (hadith.difficulty === 'zor') pointsEarned = 25;

        student.points += pointsEarned;
        student.weeklyPoints = (student.weeklyPoints || 0) + pointsEarned;

        await student.save();
        res.json({ message: 'Hadis ezberlendi olarak işaretlendi', pointsEarned });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher/student/:id/quiz-stats — Öğrenci quiz istatistikleri
router.get('/student/:id/quiz-stats', async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ user: req.params.id })
            .populate('hadith', 'number topic turkish')
            .sort('-completedAt')
            .limit(50);

        const totalAttempts = attempts.length;
        const totalCorrect = attempts.reduce((s, a) => s + a.score, 0);
        const totalQuestions = attempts.reduce((s, a) => s + a.totalQuestions, 0);
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        res.json({ attempts, totalAttempts, totalCorrect, totalQuestions, accuracy });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/teacher/assign — Hadis atama
router.post('/assign', async (req, res) => {
    try {
        const { studentId, hadithIds } = req.body;
        if (!studentId || !hadithIds || !Array.isArray(hadithIds))
            return res.status(400).json({ error: 'studentId ve hadithIds gerekli' });

        const student = await User.findById(studentId);
        if (!student || student.role !== 'student')
            return res.status(404).json({ error: 'Öğrenci bulunamadı' });

        // Max 40 hadis kontrolü
        const currentCount = student.assignedHadiths.length;
        const newIds = hadithIds.filter(id => !student.assignedHadiths.includes(id));
        if (currentCount + newIds.length > 40) {
            return res.status(400).json({ error: 'Bir öğrenciye en fazla 40 hadis atanabilir' });
        }

        student.assignedHadiths.push(...newIds);
        await student.save();
        res.json({ message: `${newIds.length} hadis atandı`, assignedCount: student.assignedHadiths.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/teacher/assign/:studentId/:hadithId — Hadis atama çıkarma
router.delete('/assign/:studentId/:hadithId', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.studentId, {
            $pull: { assignedHadiths: req.params.hadithId }
        });
        res.json({ message: 'Hadis atama çıkarıldı' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/teacher/daily-quiz — Günlük quiz seçme
router.post('/daily-quiz', async (req, res) => {
    try {
        const { hadithIds } = req.body;
        if (!hadithIds || !Array.isArray(hadithIds))
            return res.status(400).json({ error: 'hadithIds gerekli' });

        const today = new Date().toISOString().split('T')[0];

        // Bugünkü quiz varsa güncelle
        let dailyQuiz = await DailyQuiz.findOne({ teacher: req.user._id, date: today });
        if (dailyQuiz) {
            dailyQuiz.hadiths = hadithIds;
            await dailyQuiz.save();
        } else {
            dailyQuiz = await DailyQuiz.create({
                teacher: req.user._id,
                hadiths: hadithIds,
                date: today
            });
        }

        res.json({ message: 'Günlük quiz güncellendi', dailyQuiz });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher/daily-quiz — Günlük quiz getir
router.get('/daily-quiz', async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const dailyQuiz = await DailyQuiz.findOne({ date: today, isActive: true })
            .populate('hadiths', 'number arabic turkish topic source narrator difficulty');
        res.json(dailyQuiz || { hadiths: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/teacher/classes — Tüm sınıf listesi
router.get('/classes', async (req, res) => {
    try {
        const classrooms = await require('../models/Classroom').find().populate('school', 'name').sort('name');
        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
