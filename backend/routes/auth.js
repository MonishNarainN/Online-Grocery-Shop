const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password });
        // Auto-admin for the specific email
        if (email === 'rajarajeshwari@gmail.com') {
            user.role = 'admin';
        }

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, name, email, role: user.role } });
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
