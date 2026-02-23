const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/hadiths', require('./routes/hadiths'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/badges', require('./routes/badges'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/teacher', require('./routes/teacher'));

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'Hadis Akademi API çalışıyor 🕌' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Sunucu hatası' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🕌 Hadis Akademi sunucusu ${PORT} portunda çalışıyor`);
});
