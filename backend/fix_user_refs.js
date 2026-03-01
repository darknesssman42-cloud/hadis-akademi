const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to DB');
        const users = await User.find();
        let fixedCount = 0;

        for (const user of users) {
            let changed = false;

            // If school is a string that's not a valid ObjectId, unset it
            if (user.school && !mongoose.Types.ObjectId.isValid(user.school)) {
                console.log(`Unsetting invalid school for user ${user.name}: ${user.school}`);
                user.school = undefined;
                changed = true;
            }

            // If classroom is a string that's not a valid ObjectId, unset it
            if (user.classroom && !mongoose.Types.ObjectId.isValid(user.classroom)) {
                console.log(`Unsetting invalid classroom for user ${user.name}: ${user.classroom}`);
                user.classroom = undefined;
                changed = true;
            }

            if (changed) {
                await user.save();
                fixedCount++;
            }
        }

        console.log(`Done. Fixed ${fixedCount} users.`);
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
