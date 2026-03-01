const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'teacher', 'admin', 'principal', 'assistant_principal'], default: 'student' },
    school: { type: mongoose.Schema.Types.ObjectId, ref: 'School' },
    classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
    schoolNumber: { type: String }, // Okul numarası (öğrenci)
    phone: { type: String }, // Telefon (öğretmen)
    isApproved: { type: Boolean, default: true }, // öğretmen onay sistemi
    avatar: { type: String, default: '' },
    points: { type: Number, default: 0 },
    weeklyPoints: { type: Number, default: 0 }, // haftalık puan
    totalCorrect: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    memorizedHadiths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hadith' }],
    assignedHadiths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hadith' }], // öğretmen tarafından atanan
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', userSchema);
