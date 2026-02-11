const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');

        await Product.deleteMany({});
        console.log('Cleared Products.');

        await Order.deleteMany({});
        console.log('Cleared Orders.');

        console.log('Database reset complete.');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
