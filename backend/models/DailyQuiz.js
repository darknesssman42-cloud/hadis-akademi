const mongoose = require('mongoose');

const dailyQuizSchema = new mongoose.Schema({
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hadiths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hadith' }],
    date: { type: String, required: true }, // YYYY-MM-DD format
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyQuiz', dailyQuizSchema);
