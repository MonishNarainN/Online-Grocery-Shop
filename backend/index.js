const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

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

// Proxy for Chatbot (Python running internally on 5001)
app.use('/api/chat', createProxyMiddleware({
    target: 'http://127.0.0.1:5001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/chat': '/api/chat', // Keep the path as is
    },
    onError: (err, req, res) => {
        res.status(502).json({ response: "Chatbot is still starting up... Please try again in a few seconds." });
    }
}));

app.get('/api/health', (req, res) => {
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    res.status(200).json({
        status: 'ok',
        database: states[state] || 'unknown',
        readyState: state,
        hasUri: !!process.env.MONGODB_URI,
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

    // --- Spawn Python Chatbot ---
    console.log('🐍 Starting Python Chatbot process...');

    // In Docker (Linux), it's 'python3'. On Windows locally, it's 'python'.
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

    const chatbotDir = path.join(__dirname, 'chatbot');
    const chatbotScript = 'chatbot_api.py';

    console.log(`[System]: Using Python Command: ${pythonCmd}`);
    console.log(`[System]: Chatbot Dir: ${chatbotDir}`);

    const chatbot = spawn(pythonCmd, [chatbotScript], {
        cwd: chatbotDir,
        env: { ...process.env, PORT: '5001' }
    });

    chatbot.stdout.on('data', (data) => {
        console.log(`[Chatbot]: ${data}`);
    });

    chatbot.stderr.on('data', (data) => {
        console.error(`[Chatbot Error]: ${data}`);
    });

    chatbot.on('close', (code) => {
        console.log(`[Chatbot]: Process exited with code ${code}`);
    });
});

module.exports = app;
