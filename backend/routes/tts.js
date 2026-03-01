const express = require('express');
const router = express.Router();
const https = require('https');

// GET /api/tts?text=...&lang=ar
router.get('/', async (req, res) => {
    try {
        const { text, lang = 'ar' } = req.query;
        if (!text) return res.status(400).send('No text provided');

        // url length max 200 chars for google translate TTS
        const textStr = encodeURIComponent(text.substring(0, 200));
        const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${textStr}`;

        https.get(url, (googleRes) => {
            if (googleRes.statusCode !== 200) {
                return res.status(500).send('Google TTS proxy error');
            }

            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000'); // allow cache for 1 year

            googleRes.pipe(res);
        }).on('error', (err) => {
            res.status(500).send(err.message);
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
});

module.exports = router;
