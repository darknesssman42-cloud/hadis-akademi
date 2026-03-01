const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    city: { type: String },
    institutionCode: { type: String, trim: true }, // Okul kurum kodu (örn: 763119)
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('School', schoolSchema);
