const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameEn: { type: String },
    description: { type: String, required: true },
    icon: { type: String, required: true }, // emoji or icon name
    color: { type: String, default: '#FFD700' },
    rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
    difficultyBonus: { type: Number, default: 0 }, // zorluk bazlı ek puan
    requirement: {
        type: { type: String, enum: ['points', 'memorized', 'correct', 'streak', 'quizzes', 'weekly_rank', 'manual'] },
        value: Number
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Badge', badgeSchema);
