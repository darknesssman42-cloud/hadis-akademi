const mongoose = require('mongoose');

const sharedExampleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hadith: { type: mongoose.Schema.Types.ObjectId, ref: 'Hadith', required: true },
    content: { type: String, required: true, maxlength: 500 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SharedExample', sharedExampleSchema);
