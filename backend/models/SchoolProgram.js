const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    content: { type: String, default: 'Okul Ezber programı açıklaması...' },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SchoolProgram', schema);
