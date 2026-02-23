const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameEn: { type: String },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // emoji or icon name
    color: { type: String, default: '#FFD700' },
    requirement: {
        type: { type: String, enum: ['points', 'memorized', 'correct', 'streak', 'quizzes'] },
        value: Number
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Badge', badgeSchema);
