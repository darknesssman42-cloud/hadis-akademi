const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// Security Middleware (Firewall Protection)
app.use(helmet()); // Sets various HTTP headers for security

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use('/api/', limiter); // Apply rate limiting to all API requests

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
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tts', require('./routes/tts'));
app.use('/api/manager', require('./routes/manager'));
app.use('/api/school-program', require('./routes/schoolProgram'));
app.use('/api/schools', require('./routes/schools'));
app.use('/api/classrooms', require('./routes/classrooms'));
app.use('/api/assignments', require('./routes/assignments'));

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
