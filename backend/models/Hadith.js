const mongoose = require('mongoose');

const hadithSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true },
    arabic: { type: String, required: true },
    turkish: { type: String, required: true },
    narrator: { type: String, required: true }, // Ravi
    source: { type: String, required: true }, // Kaynak (Buhari, Müslim...)
    topic: { type: String, required: true }, // Konu
    dailyExample: { type: String }, // Günlük hayat örneği
    difficulty: { type: String, enum: ['kolay', 'orta', 'zor'], default: 'orta' },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hadith', hadithSchema);
