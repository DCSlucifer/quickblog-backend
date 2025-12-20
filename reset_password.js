
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const resetPassword = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is not set in .env");
            process.exit(1);
        }

        console.log("Connecting to Database...");
        await mongoose.connect(`${process.env.MONGODB_URI}/quickblog`);
        console.log("Database Connected");

        // User from screenshot
        const email = 'vothanhdanh8208@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
            return;
        }

        console.log(`Found user: ${user.name} (${user.role})`);

        // Hashing the new password the user set in plain text
        const rawPassword = '12341243a5';
        console.log(`Hashing password: ${rawPassword}`);

        const hashedPassword = await bcrypt.hash(rawPassword, 10);
        user.password = hashedPassword;

        await user.save();
        console.log("Password updated successfully.");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
};

resetPassword();
