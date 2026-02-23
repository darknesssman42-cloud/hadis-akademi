const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Token oluşturma yardımcısı
const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/auth/register
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Ad zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('role').isIn(['student', 'teacher']).withMessage('Geçersiz rol')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, class: studentClass } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı' });

        const user = await User.create({ name, email, password, role, class: studentClass });
        res.status(201).json({
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role, points: user.points }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/login
router.post('/login', [
    body('email').isEmail(),
    body('password').notEmpty()
], async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).populate('badges');
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ error: 'E-posta veya şifre hatalı' });

        // Streak kontrolü
        const today = new Date().toDateString();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            user.streak = lastLogin === yesterday.toDateString() ? user.streak + 1 : 1;
            user.lastLoginDate = new Date();
            await user.save();
        }

        res.json({
            token: generateToken(user._id),
            user: {
                id: user._id, name: user.name, email: user.email, role: user.role,
                points: user.points, streak: user.streak, badges: user.badges,
                class: user.class, memorizedHadiths: user.memorizedHadiths
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
    const user = await User.findById(req.user._id).populate('badges').populate('memorizedHadiths');
    res.json(user);
});

module.exports = router;
