const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/promotions', require('./routes/promotions'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
        status: 'ok',
        message: 'API is running',
        database: dbStatus,
        env: process.env.NODE_ENV || 'development'
    });
});

app.get('/', (req, res) => {
    res.send('Grocery Store API is running...');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);

    // Environment Variable Checks
    const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
    requiredEnv.forEach(env => {
        if (!process.env[env]) {
            console.error(`❌ ERROR: ${env} is not defined in environment variables!`);
        }
    });

    if (process.env.MONGODB_URI) {
        mongoose.connect(process.env.MONGODB_URI)
            .then(() => console.log('✅ Connected to MongoDB Atlas'))
            .catch(err => console.error('❌ MongoDB connection error:', err.message));
    }
});

module.exports = app;
