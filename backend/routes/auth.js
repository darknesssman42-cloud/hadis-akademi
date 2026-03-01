const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// Token oluşturma yardımcısı
const generateToken = (id, rememberMe = false) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: rememberMe ? '30d' : process.env.JWT_EXPIRE });

// POST /api/auth/register/student — Öğrenci Kayıt
router.post('/register/student', [
    body('name').trim().notEmpty().withMessage('Ad zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('school').notEmpty().withMessage('Okul seçimi zorunludur'),
    body('classroom').notEmpty().withMessage('Sınıf seçimi zorunludur'),
    body('schoolNumber').trim().notEmpty().withMessage('Okul numarası zorunludur')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, school, classroom, schoolNumber } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı' });

        const user = await User.create({
            name, email, password,
            role: 'student',
            school,
            classroom,
            schoolNumber,
            isApproved: true
        });

        const fullUser = await User.findById(user._id).populate('school', 'name').populate('classroom', 'name');

        res.status(201).json({
            token: generateToken(user._id),
            user: fullUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/register/teacher — Öğretmen Kayıt (Admin onaylı)
router.post('/register/teacher', [
    body('name').trim().notEmpty().withMessage('Ad Soyad zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('phone').trim().notEmpty().withMessage('Telefon numarası zorunludur'),
    body('school').notEmpty().withMessage('Okul seçimi zorunludur')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, school } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı' });

        const user = await User.create({
            name, email, password, phone, school,
            role: 'teacher',
            isApproved: false // Admin onayı gerekli
        });

        res.status(201).json({
            message: 'Kayıt başarılı! Hesabınız admin onayı bekliyor.',
            pending: true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/auth/register/manager — İdareci Kayıt (Admin onaylı)
router.post('/register/manager', [
    body('name').trim().notEmpty().withMessage('Ad Soyad zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('phone').trim().notEmpty().withMessage('Telefon numarası zorunludur'),
    body('school').notEmpty().withMessage('Okul seçimi zorunludur'),
    body('role').isIn(['principal', 'assistant_principal']).withMessage('Geçersiz rol')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, phone, school, role } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı' });

        const user = await User.create({
            name, email, password, phone, school, role,
            isApproved: false // Admin onayı gerekli
        });

        res.status(201).json({
            message: 'Kayıt başarılı! İdareci hesabınız admin onayı bekliyor.',
            pending: true
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eski genel register endpoint (geriye uyumluluk)
router.post('/register', [
    body('name').trim().notEmpty().withMessage('Ad zorunludur'),
    body('email').isEmail().withMessage('Geçerli e-posta girin'),
    body('password').isLength({ min: 6 }).withMessage('Şifre en az 6 karakter olmalı'),
    body('role').isIn(['student', 'teacher']).withMessage('Geçersiz rol')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role, class: studentClass, schoolNumber, phone } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Bu e-posta zaten kayıtlı' });

        const user = await User.create({
            name, email, password, role,
            class: studentClass,
            schoolNumber,
            phone,
            isApproved: role === 'student'
        });

        if (role === 'teacher') {
            return res.status(201).json({ message: 'Kayıt başarılı! Hesabınız admin onayı bekliyor.', pending: true });
        }

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
    const { email, password, rememberMe } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password)))
            return res.status(401).json({ error: 'E-posta veya şifre hatalı' });

        if (!user.isApproved) {
            return res.status(403).json({ error: 'Hesabınız henüz admin tarafından onaylanmadı. Lütfen bekleyin.' });
        }

        const today = new Date().toDateString();
        const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate).toDateString() : null;
        if (lastLogin !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            user.streak = lastLogin === yesterday.toDateString() ? user.streak + 1 : 1;
            user.lastLoginDate = new Date();
            await user.save();
        }

        const fullUser = await User.findById(user._id)
            .populate('badges')
            .populate('school', 'name')
            .populate('classroom', 'name');

        res.json({
            token: generateToken(user._id, rememberMe),
            user: fullUser
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('badges')
        .populate('memorizedHadiths')
        .populate('school', 'name')
        .populate('classroom', 'name');
    res.json(user);
});

// POST /api/auth/forgotpassword
router.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.' });

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // Şimdilik sadece konsola yazdırıyoruz (E-posta servisi kurulana kadar)
        console.log(`\n🔑 Şifre Sıfırlama İsteği:\nEmail: ${email}\nURL: ${resetUrl}\n`);

        res.json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/auth/resetpassword/:resettoken
router.put('/resetpassword/:resettoken', async (req, res) => {
    try {
        // Hash token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ error: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı' });

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Şifre başarıyla güncellendi. Artık giriş yapabilirsiniz.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
