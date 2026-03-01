const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('--- ADMIN USER ---');
            console.log('Name:', admin.name);
            console.log('Email:', admin.email);
            console.log('Is Approved:', admin.isApproved);

            // Si pas approved, on le force à true
            if (!admin.isApproved) {
                admin.isApproved = true;
                await admin.save();
                console.log('Admin account was not approved, fixed it now.');
            }
        } else {
            console.log('No admin user found.');
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkAdmin();
