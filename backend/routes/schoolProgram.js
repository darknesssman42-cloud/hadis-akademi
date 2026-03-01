const express = require('express');
const router = express.Router();
const SchoolProgram = require('../models/SchoolProgram');
const DailyQuiz = require('../models/DailyQuiz');

// GET /api/school-program -> Gets custom text + today's daily quiz hadiths
router.get('/', async (req, res) => {
    try {
        let program = await SchoolProgram.findOne();
        if (!program) {
            program = await SchoolProgram.create({ content: 'Buraya admin tarafından Okul Ezber metni girilecek...' });
        }

        const today = new Date().toISOString().split('T')[0];
        const dailyQuiz = await DailyQuiz.findOne({ date: today, isActive: true })
            .populate('hadiths');

        res.json({
            content: program.content,
            dailyQuizHadiths: dailyQuiz ? dailyQuiz.hadiths : []
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
