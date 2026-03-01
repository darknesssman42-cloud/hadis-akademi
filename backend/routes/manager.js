const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const { protect, authorize } = require('../middleware/auth');

// İdareci koruması (Admin de erişebilir)
router.use(protect, authorize('principal', 'assistant_principal', 'admin'));

// GET /api/manager/teachers — Okulundaki öğretmenler
router.get('/teachers', async (req, res) => {
    try {
        const query = { role: 'teacher', school: req.user.school };
        const teachers = await User.find(query).select('-password').sort('-createdAt');
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/manager/teachers/:id/approve — Öğretmen onayı
router.put('/teachers/:id/approve', async (req, res) => {
    try {
        const teacher = await User.findOne({ _id: req.params.id, school: req.user.school, role: 'teacher' });
        if (!teacher) return res.status(404).json({ error: 'Öğretmen bulunamadı veya bu okulda değil' });

        teacher.isApproved = true;
        await teacher.save();
        res.json({ message: 'Öğretmen onaylandı', teacher });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/manager/teachers/:id/reject — Öğretmen reddetme
router.put('/teachers/:id/reject', async (req, res) => {
    try {
        const teacher = await User.findOne({ _id: req.params.id, school: req.user.school, role: 'teacher' });
        if (!teacher) return res.status(404).json({ error: 'Öğretmen bulunamadı veya bu okulda değil' });

        teacher.isApproved = false;
        await teacher.save();
        res.json({ message: 'Öğretmen reddedildi', teacher });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/manager/classrooms — Okulundaki sınıflar
router.get('/classrooms', async (req, res) => {
    try {
        const classrooms = await Classroom.find({ school: req.user.school }).sort('name');
        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/manager/classrooms — Sınıf ekle
router.post('/classrooms', async (req, res) => {
    try {
        const classroom = await Classroom.create({
            ...req.body,
            school: req.user.school
        });
        res.status(201).json(classroom);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/manager/classrooms/:id — Sınıf sil
router.delete('/classrooms/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findOneAndDelete({ _id: req.params.id, school: req.user.school });
        if (!classroom) return res.status(404).json({ error: 'Sınıf bulunamadı veya bu okulda değil' });
        res.json({ message: 'Sınıf silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/manager/stats — Okul bazlı istatistikler
router.get('/stats', async (req, res) => {
    try {
        const schoolId = req.user.school;

        const [totalStudents, totalTeachers, totalClassrooms] = await Promise.all([
            User.countDocuments({ school: schoolId, role: 'student' }),
            User.countDocuments({ school: schoolId, role: 'teacher' }),
            Classroom.countDocuments({ school: schoolId })
        ]);

        // Okulun ortalama puanı
        const students = await User.find({ school: schoolId, role: 'student' }).select('points');
        const avgScore = students.length > 0
            ? Math.round(students.reduce((acc, curr) => acc + (curr.points || 0), 0) / students.length)
            : 0;

        // En başarılı 5 öğrenci
        const topStudents = await User.find({ school: schoolId, role: 'student' })
            .select('name points classroom')
            .populate('classroom', 'name')
            .sort('-points')
            .limit(5);

        res.json({
            totalStudents,
            totalTeachers,
            totalClassrooms,
            avgScore,
            topStudents
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/manager/users — Okulundaki tüm kullanıcılar
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({ school: req.user.school })
            .select('-password')
            .populate('classroom', 'name')
            .sort('-createdAt');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/manager/users/:id — Kullanıcı sil (Sadece kendi okulundakiler)
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, school: req.user.school });
        if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı veya yetkiniz yok' });
        res.json({ message: 'Kullanıcı silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
