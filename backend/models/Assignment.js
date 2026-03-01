const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    hadiths: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hadith' }],
    classrooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }], // can assign to one or more classrooms
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // optional deadline
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
