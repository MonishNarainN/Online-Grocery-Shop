const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 10000; // Default to 10000 for Render

// --- 1. Robust CORS Middleware ---
app.use(cors({
    origin: true, // Dynamically allow the origin that is making the request
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));

// --- 2. Request Logger (Helpful for debugging) ---
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

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
app.use('/api/chat', (req, res, next) => {
    // Ensure CORS headers are present even on proxy failure
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
}, createProxyMiddleware({
    target: 'http://127.0.0.1:5001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/chat': '/api/chat',
    },
    onError: (err, req, res) => {
        console.error('[Proxy Error]:', err);
        res.status(502).json({ response: "Chatbot is still starting up or unavailable. Please try again." });
    }
}));

// --- 3. Global Error Handler ---
app.use((err, req, res, next) => {
    console.error(`[Global Error] ${req.method} ${req.url}:`, err.stack);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Detailed error in server logs.'
    });
});

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

// --- 3.5 Catch-all 404 Logging (Must be last) ---
app.use((req, res) => {
    console.warn(`[404 Not Found] ${req.method} ${req.url}`);
    res.status(404).json({ message: `Route ${req.method} ${req.url} not found on this server.` });
});

// --- 4. Database Connection ---
if (process.env.MONGODB_URI) {
    console.log('⏳ Connecting to MongoDB Atlas...');
    mongoose.connect(process.env.MONGODB_URI)
        .then(async () => {
            console.log('✅ Connected to MongoDB Atlas');

            // One-time Admin Seeder
            try {
                const User = require('./models/User');
                const adminEmail = 'rajarajeshwari@gmail.com';
                const existingAdmin = await User.findOne({ email: adminEmail });

                if (!existingAdmin) {
                    console.log('🚀 Creating default Admin account...');
                    const newAdmin = new User({
                        name: 'Main Admin',
                        email: adminEmail,
                        password: 'Admin@123',
                        role: 'admin',
                        isVerified: true
                    });
                    await newAdmin.save();
                    console.log('✅ Admin account created successfully!');
                } else {
                    console.log('ℹ️ Admin account already exists.');
                }
            } catch (seederErr) {
                console.error('❌ Admin seeder error:', seederErr.message);
            }
        })
        .catch(err => {
            console.error('❌ MongoDB connection error:', err.message);
            // Don't exit - let the server start so we can see the health check status
        });
} else {
    console.warn('⚠️ MONGODB_URI not found. Database features will be disabled.');
}

// --- 5. Spawn Python Chatbot ---
function startChatbot() {
    console.log('🐍 Starting Python Chatbot process...');

    // In Docker (Linux), it's usually 'python3'. On Windows locally, it's 'python'.
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
        console.log(`[Chatbot]: ${data.toString().trim()}`);
    });

    chatbot.stderr.on('data', (data) => {
        console.error(`[Chatbot Error]: ${data.toString().trim()}`);
    });

    chatbot.on('error', (err) => {
        console.error('❌ Failed to start Chatbot process:', err.message);
        console.log('ℹ️ Ensure Python and dependencies are installed correctly.');
    });

    chatbot.on('close', (code) => {
        console.log(`[Chatbot]: Process exited with code ${code}`);
        if (code !== 0) {
            console.log('🔄 Attempting to restart chatbot in 10 seconds...');
            setTimeout(startChatbot, 10000);
        }
    });

    return chatbot;
}

// Start chatbot
let chatbotProcess = startChatbot();

// --- 6. Start Server ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌍 Health check available at /api/health`);

    // Environment Variable Checks
    const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
    requiredEnv.forEach(env => {
        if (!process.env[env]) {
            console.error(`❌ CRITICAL: ${env} is missing from environment variables!`);
        }
    });
});

module.exports = app;
