const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const { sendVerificationEmail } = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

const logToFile = (message) => {
    const logPath = path.join(__dirname, '../debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `${timestamp} - ${message}\n`);
};

// Register
router.post('/register', async (req, res) => {
    logToFile('Register request received:', req.body.email); // Debug log
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        // If user exists and is verified, return error
        if (user && user.isVerified) {
            logToFile('User already exists and verified'); // Debug log
            return res.status(400).json({ message: 'User already exists' });
        }

        // If user exists but not verified, we can update them (re-register)
        // Or for simplicity, just handle as new if not verified (overwrite)

        if (user && !user.isVerified) {
            // Update existing unverified user
            // Hashing happens in pre-save, so we set password directly
            user.name = name;
            user.password = password;
        } else {
            // Create new user
            user = new User({ name, email, password });
        }

        // Auto-admin for the specific email
        if (email === 'rajarajeshwari@gmail.com') {
            user.role = 'admin';
            user.isVerified = true;
        } else {
            // Generate 6 digit code
            const code = Math.floor(100000 + Math.random() * 900000).toString();
            user.verificationCode = code;
            user.isVerified = false;

            // Send email
            logToFile('Attempting to send verification email to:', email); // Debug log
            const emailResult = await sendVerificationEmail(email, code);
            logToFile('Email result:', emailResult); // Debug log

            if (!emailResult.success) {
                logToFile(`Email sending failed: ${JSON.stringify(emailResult.error)}`); // Debug log with error

                // In development, handle gracefully
                // Check for development environment or if specific env var is set
                if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                    const msg = `DEV MODE: Verification Code for ${email}: ${code}`;
                    console.log(msg);
                    logToFile(msg);
                    // Proceed as if success - do NOT return error
                } else {
                    return res.status(500).json({ message: `Error sending verification email: ${emailResult.error}` });
                }
            }
        }

        await user.save();
        logToFile('User saved successfully'); // Debug log

        if (user.isVerified) {
            // Admin or pre-verified
            const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
            return res.json({ token, user: { id: user._id, name, email, role: user.role } });
        }

        res.json({ message: 'Verification code sent to email', requireVerification: true, email });

    } catch (err) {
        logToFile('Registration error caught:', err); // Debug log
        res.status(500).json({ message: err.message });
    }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });
        if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid verification code' });

        user.isVerified = true;
        user.verificationCode = undefined;
        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified', requireVerification: true, email });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add address (Tiruvannamalai only)
router.post('/add-address', auth, async (req, res) => {
    const { label, address_line, city, pincode, is_default } = req.body;

    // Strict Location Validation
    if (city.toLowerCase() !== 'tiruvannamalai') {
        return res.status(400).json({ message: "Sorry, we currently serve only in Tiruvannamalai." });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newAddress = { label, address_line, city, pincode, is_default };

        if (is_default) {
            user.saved_addresses.forEach(addr => addr.is_default = false);
        }

        user.saved_addresses.push(newAddress);
        await user.save();

        // Return the updated user object (or at least the addresses) so frontend can update state
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
