const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hadith: { type: mongoose.Schema.Types.ObjectId, ref: 'Hadith', required: true },
    quizType: { type: String, enum: ['multiple_choice', 'fill_blank', 'matching'], required: true },
    questions: [
        {
            questionText: String,
            options: [String],         // for multiple choice
            correctAnswer: String,
            userAnswer: String,
            isCorrect: Boolean
        }
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number },
    pointsEarned: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
