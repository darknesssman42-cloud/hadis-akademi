const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hadith = require('../models/Hadith');
const Badge = require('../models/Badge');
const QuizAttempt = require('../models/QuizAttempt');
const School = require('../models/School');
const Classroom = require('../models/Classroom');
const SchoolProgram = require('../models/SchoolProgram');
const { protect, authorize } = require('../middleware/auth');

// Admin koruma
router.use(protect, authorize('admin'));

// GET /api/admin/users — Tüm kullanıcılar
router.get('/users', async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .populate('badges', 'name icon')
            .populate('school', 'name')
            .populate('classroom', 'name')
            .sort('-createdAt');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/users/:id/approve — Öğretmen onayı
router.put('/users/:id/approve', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        user.isApproved = true;
        await user.save();
        res.json({ message: 'Kullanıcı onaylandı', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/users/:id/reject — Öğretmen reddetme
router.put('/users/:id/reject', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        user.isApproved = false;
        await user.save();
        res.json({ message: 'Kullanıcı reddedildi', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/users/:id/role — Rol değiştirme
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'teacher', 'admin'].includes(role))
            return res.status(400).json({ error: 'Geçersiz rol' });

        const user = await User.findByIdAndUpdate(req.params.id, { role, isApproved: true }, { new: true }).select('-password');
        res.json({ message: 'Rol güncellendi', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/users/:id — Kullanıcı silme
router.delete('/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Kullanıcı silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =================== HADİS YÖNETİMİ ===================

// POST /api/admin/hadiths — Hadis ekleme
router.post('/hadiths', async (req, res) => {
    try {
        const hadith = await Hadith.create(req.body);
        res.status(201).json(hadith);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/hadiths/:id — Hadis düzenleme
router.put('/hadiths/:id', async (req, res) => {
    try {
        const hadith = await Hadith.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });
        res.json(hadith);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/hadiths/:id/school-program — Okul Ezber Programına ekle/çıkar
router.put('/hadiths/:id/school-program', async (req, res) => {
    try {
        const hadith = await Hadith.findById(req.params.id);
        if (!hadith) return res.status(404).json({ error: 'Hadis bulunamadı' });
        hadith.isSchoolProgram = !hadith.isSchoolProgram;
        await hadith.save();
        res.json({ message: hadith.isSchoolProgram ? 'Okul Ezber programına eklendi' : 'Okul Ezber programından çıkarıldı', hadith });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/hadiths/:id — Hadis silme
router.delete('/hadiths/:id', async (req, res) => {
    try {
        await Hadith.findByIdAndDelete(req.params.id);
        res.json({ message: 'Hadis silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =================== OKUL VE SINIF YÖNETİMİ ===================

// GET /api/admin/schools — Tüm okullar
router.get('/schools', async (req, res) => {
    try {
        const schools = await School.find().sort('name');
        res.json(schools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/schools — Okul ekle
router.post('/schools', async (req, res) => {
    try {
        const school = await School.create(req.body);
        res.status(201).json(school);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/schools/:id — Okul güncelle
router.put('/schools/:id', async (req, res) => {
    try {
        const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(school);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/schools/:id — Okul sil
router.delete('/schools/:id', async (req, res) => {
    try {
        await School.findByIdAndDelete(req.params.id);
        res.json({ message: 'Okul silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/admin/classrooms — Tüm sınıflar
router.get('/classrooms', async (req, res) => {
    try {
        const classrooms = await Classroom.find().populate('school', 'name').sort('name');
        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/admin/classrooms — Sınıf ekle
router.post('/classrooms', async (req, res) => {
    try {
        const classroom = await Classroom.create(req.body);
        res.status(201).json(classroom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/classrooms/:id — Sınıf güncelle
router.put('/classrooms/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(classroom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/classrooms/:id — Sınıf sil
router.delete('/classrooms/:id', async (req, res) => {
    try {
        await Classroom.findByIdAndDelete(req.params.id);
        res.json({ message: 'Sınıf silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/school-program — Özel metin güncelle
router.put('/school-program', async (req, res) => {
    try {
        let program = await SchoolProgram.findOne();
        if (!program) {
            program = new SchoolProgram();
        }
        program.content = req.body.content;
        program.updatedAt = Date.now();
        await program.save();
        res.json({ message: 'Okul Ezberi güncellendi', program });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =================== ROZET YÖNETİMİ ===================

// POST /api/admin/badges — Rozet ekleme
router.post('/badges', async (req, res) => {
    try {
        const badge = await Badge.create(req.body);
        res.status(201).json(badge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/badges/:id — Rozet düzenleme
router.put('/badges/:id', async (req, res) => {
    try {
        const badge = await Badge.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!badge) return res.status(404).json({ error: 'Rozet bulunamadı' });
        res.json(badge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/badges/:id — Rozet silme
router.delete('/badges/:id', async (req, res) => {
    try {
        await Badge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rozet silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =================== İSTATİSTİKLER ===================

// GET /api/admin/stats — Genel istatistikler
router.get('/stats', async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const pendingTeachers = await User.countDocuments({ role: 'teacher', isApproved: false });
        const totalHadiths = await Hadith.countDocuments();
        const totalBadges = await Badge.countDocuments();
        const totalQuizzes = await QuizAttempt.countDocuments();

        const allAttempts = await QuizAttempt.find();
        const avgScore = totalQuizzes > 0
            ? Math.round(allAttempts.reduce((s, a) => s + (a.score / a.totalQuestions * 100), 0) / totalQuizzes)
            : 0;

        const topStudents = await User.find({ role: 'student' })
            .sort({ points: -1 })
            .limit(5)
            .select('name points classroom class')
            .populate('classroom', 'name');

        // Son 7 gün quiz aktivitesi
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentQuizzes = await QuizAttempt.countDocuments({ completedAt: { $gte: weekAgo } });

        const stats = {
            totalStudents, totalTeachers, pendingTeachers,
            totalHadiths, totalBadges, totalQuizzes,
            avgScore, topStudents, recentQuizzes,
            totalSchools: await School.countDocuments(),
            totalClassrooms: await Classroom.countDocuments()
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
