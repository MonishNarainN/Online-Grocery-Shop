const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Settings = require('../models/Settings'); // Import Settings
const router = express.Router();
const auth = require('../middleware/auth'); // If you want to protect payment routes

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to get the key id for the frontend
router.get('/config', (req, res) => {
    res.json({ key_id: process.env.RAZORPAY_KEY_ID });
});

// Route to create a Razorpay order
router.post('/create-order', auth, async (req, res) => {
    try {
        // Check store status before allowing checkout initiation
        const settings = await Settings.findOne({ singleton_id: 'global' });
        if (settings && !settings.is_online) {
            const timeMsg = settings.offline_until ? ` until ${new Date(settings.offline_until).toLocaleString()}` : '';
            return res.status(400).json({ message: `Currently the store is offline${timeMsg}, visit again.` });
        }

        const { amount } = req.body;

        // Amount must be in paise (e.g., multiply by 100 for INR)
        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
        };

        const order = await razorpay.orders.create(options);

        if (!order) {
            return res.status(500).send('Storage Error');
        }

        res.json(order);
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route to verify the payment signature
router.post('/verify', auth, (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            // Payment is successful and verified
            res.json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature sent!' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
