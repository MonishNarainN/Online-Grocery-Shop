const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const adminUser = {
    name: "Master Admin",
    email: "rajarajeshwari@gmail.com",
    password: "Admin@123",
    role: "admin"
};

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminUser.email });
        if (existingAdmin) {
            console.log('Admin user already exists. Updating password/role...');
            existingAdmin.password = adminUser.password; // Will be hashed by pre-save hook
            existingAdmin.role = 'admin';
            await existingAdmin.save();
        } else {
            console.log('Creating new Admin user...');
            const newUser = new User(adminUser);
            await newUser.save();
        }

        console.log('Admin configured successfully:');
        console.log(`Email: ${adminUser.email}`);
        console.log(`Password: ${adminUser.password}`);

        mongoose.connection.close();
    } catch (err) {
        console.error('Error configuring admin:', err);
        process.exit(1);
    }
}

createAdmin();
