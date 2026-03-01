const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listAdmins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({ role: 'admin' });
        console.log('--- ADMIN LIST ---');
        users.forEach(u => console.log(`Name: ${u.name}, Email: ${u.email}, ID: ${u._id}`));
        await mongoose.disconnect();
    } catch (err) { console.error(err); }
}

listAdmins();
