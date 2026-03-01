const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const admin = await User.findOne({ role: 'admin' });
    if (admin) {
        console.log('Admin found:', admin.email);
    } else {
        console.log('NO ADMIN FOUND');
    }
    process.exit(0);
});
