const express = require('express');
const router = express.Router();
const School = require('../models/School');

// GET /api/schools — Tüm okulları listele (kayıt sırasında lazım)
router.get('/', async (req, res) => {
    try {
        const schools = await School.find().sort('name');
        res.json(schools);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
