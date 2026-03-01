const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

// GET /api/classrooms/school/:schoolId — Okuldaki tüm sınıfları listele
router.get('/school/:schoolId', async (req, res) => {
    try {
        const classrooms = await Classroom.find({ school: req.params.schoolId }).sort('name').populate('school', 'name');
        res.json(classrooms);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/classrooms/my-classmate — Sınıf arkadaşlarımı listele (Öğrenci)
router.get('/my-classmates', protect, async (req, res) => {
    try {
        if (!req.user.classroom) return res.status(400).json({ error: 'Sınıfınız tanımlı değil' });
        const students = await User.find({ classroom: req.user.classroom, role: 'student' })
            .select('name email points streak avatar')
            .sort('-points');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/classrooms/:id/students — Sınıfın tüm öğrencilerini getir (Öğretmen/Admin)
router.get('/:id/students', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const students = await User.find({ classroom: req.params.id, role: 'student' })
            .select('name email points streak schoolNumber')
            .sort('name');
        res.json(students);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
