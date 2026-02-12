const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');

        // Clear Products
        // await Product.deleteMany({});
        // console.log('Cleared Products.');

        // Clear Orders
        // await Order.deleteMany({}); 
        // console.log('Cleared Orders.');

        // Delete all users EXCEPT admin
        const result = await User.deleteMany({ email: { $ne: 'rajarajeshwari@gmail.com' } });
        console.log(`Deleted ${result.deletedCount} non-admin users.`);

        console.log('Database cleanup complete.');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
