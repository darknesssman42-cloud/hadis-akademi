const express = require('express');
const router = express.Router();
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// POST /api/assignments — Yeni ödev/quiz oluştur (Öğretmen)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const { title, hadiths, classrooms, endDate } = req.body;
        const assignment = await Assignment.create({
            title,
            hadiths,
            classrooms,
            endDate,
            teacher: req.user.id
        });
        res.status(201).json(assignment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/assignments/my-class — Öğrencinin kendi sınıfına ait ödevleri getir
router.get('/my-class', protect, async (req, res) => {
    try {
        if (!req.user.classroom) {
            return res.status(400).json({ error: 'Sınıfınız tanımlı değil' });
        }
        const assignments = await Assignment.find({
            classrooms: req.user.classroom,
            isActive: true
        })
            .populate('teacher', 'name')
            .populate('hadiths')
            .sort('-createdAt');

        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/assignments/teacher — Öğretmenin kendi oluşturduğu ödevleri getir
router.get('/teacher', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const assignments = await Assignment.find({ teacher: req.user.id })
            .populate('classrooms', 'name')
            .populate('hadiths')
            .sort('-createdAt');
        res.json(assignments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/assignments/:id — Ödevi sil (Öğretmen)
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
    try {
        const assignment = await Assignment.findOneAndDelete({ _id: req.params.id, teacher: req.user.id });
        if (!assignment) return res.status(404).json({ error: 'Ödev bulunamadı veya silme yetkiniz yok' });
        res.json({ message: 'Ödev başarıyla silindi' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
