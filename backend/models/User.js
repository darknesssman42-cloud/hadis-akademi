const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'teacher'], default: 'student' },
    class: { type: String }, // e.g. "10-A"
    avatar: { type: String, default: '' },
    points: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalAttempted: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    lastLoginDate: { type: Date },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    memorizedHadiths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hadith' }],
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

module.exports = mongoose.model('User', userSchema);
