const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await User.findOne({ email: 'admin@hadis.com' });
        if (admin) {
            console.log('Admin user found, resetting password...');
            admin.password = '123456';
            admin.isApproved = true;
            await admin.save();
            console.log('Password reset to: 123456');
        } else {
            console.log('Creating new admin...');
            await User.create({
                name: 'Admin',
                email: 'admin@hadis.com',
                password: '123456',
                role: 'admin',
                isApproved: true
            });
            console.log('Admin created with password: 123456');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

resetAdmin();
