const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

const { sendVerificationEmail, sendPasswordResetEmail, sendAdminNotificationEmail } = require('../utils/emailService');
const fs = require('fs');
const path = require('path');

const logToFile = (message, ...args) => {
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true' || !!process.env.VERCEL;
    const timestamp = new Date().toISOString();
    
    if (isVercel) {
        console.log(`[Vercel Log] ${timestamp} - ${message}`, ...args);
        return;
    }

    try {
        const logPath = path.join(__dirname, '../debug.log');
        fs.appendFileSync(logPath, `${timestamp} - ${message} ${args.length ? JSON.stringify(args) : ''}\n`);
    } catch (err) {
        console.error('Failed to write to log file:', err.message);
        console.log(`[Fallback Log] ${timestamp} - ${message}`, ...args);
    }
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

            // Send email asynchronously (non-blocking)
            logToFile('Attempting to send verification email to:', email);
            sendVerificationEmail(email, code).then(emailResult => {
                logToFile('Email result:', emailResult);
                if (!emailResult.success) {
                    logToFile(`Email sending failed: ${JSON.stringify(emailResult.error)}`);
                    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                        console.log(`DEV MODE: Verification Code for ${email}: ${code}`);
                    }
                }
            }).catch(err => {
                logToFile('Email promise error:', err);
            });
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

        // if (!user.isVerified) {
        //     return res.status(403).json({ message: 'Email not verified', requireVerification: true, email });
        // }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name: user.name, email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'There is no such email' });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        user.verificationCode = code;
        await user.save();

        // Send email asynchronously (non-blocking)
        sendPasswordResetEmail(email, code).then(emailResult => {
            if (!emailResult.success) {
                if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
                    console.log(`DEV MODE: Password Reset Code for ${email}: ${code}`);
                }
            }
        }).catch(err => {
            console.error('Password reset email error:', err);
        });

        res.json({ message: 'Password reset code sent to your email.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.verificationCode !== code) return res.status(400).json({ message: 'Invalid verification code' });

        // User schema pre-save hook will hash the plain text password
        user.password = newPassword;
        user.verificationCode = undefined;
        await user.save();

        res.json({ message: 'Password has been successfully reset. You can now log in.' });
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

// Get wishlist
router.get('/wishlist', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // We might want to attach promotions to wishlist items too, but for now just return populated products
        res.json(user.wishlist);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add to wishlist
router.post('/wishlist', auth, async (req, res) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }
        res.json({ message: 'Added to wishlist', wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Remove from wishlist
router.delete('/wishlist/:productId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
        await user.save();
        res.json({ message: 'Removed from wishlist', wishlist: user.wishlist });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Get all users
router.get('/admin/all', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const users = await User.find().sort({ created_at: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Toggle user role
router.put('/admin/users/:id/role', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Prevent changing the main admin's role
        if (user.email === 'rajarajeshwari@gmail.com') {
            return res.status(400).json({ message: 'Cannot modify the master admin role' });
        }

        // Prevent unverified users from becoming admins
        if (req.body.role === 'admin' && !user.isVerified) {
            return res.status(400).json({ message: 'Cannot make an unverified user an admin' });
        }

        user.role = req.body.role;
        await user.save();

        // Send notification email asynchronously
        sendAdminNotificationEmail(user.email, user.name, user.role).catch(err => {
            console.error('Failed to send admin notification email:', err);
        });

        res.json({ message: 'User role updated successfully', user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
