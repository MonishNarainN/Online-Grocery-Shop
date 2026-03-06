const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User'); // Import User model to fetch email
const Settings = require('../models/Settings'); // Import Settings model
const { sendOrderConfirmationEmail } = require('../utils/emailService'); // Import email service
const auth = require('../middleware/auth');
const router = express.Router();

// Create order
router.post('/', auth, async (req, res) => {
    try {
        // Double check store status before saving the final order
        const settings = await Settings.findOne({ singleton_id: 'global' });
        if (settings && !settings.is_online) {
            const timeMsg = settings.offline_until ? ` until ${new Date(settings.offline_until).toLocaleString()}` : '';
            return res.status(400).json({ message: `Currently the store is offline${timeMsg}, visit again.` });
        }

        const order = new Order({
            ...req.body,
            user_id: req.user.id
        });
        await order.save();

        // Send email if payment is successful
        if (order.payment_status === 'paid') {
            try {
                const user = await User.findById(req.user.id);
                if (user && user.email) {
                    // Fire and forget, don't await blocking the response
                    sendOrderConfirmationEmail(user.email, user.name, order);
                }
            } catch (emailErr) {
                console.error("Failed to trigger order confirmation email:", emailErr);
            }
        }

        res.status(201).json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user_id: req.user.id }).sort('-created_at');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Get all orders
router.get('/admin/all', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const orders = await Order.find().sort('-created_at');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin: Update order status
router.patch('/:id/status', auth, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { order_status: req.body.order_status },
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const { generateOrderPdf } = require('../utils/pdfService');

// Get Order PDF Bill
router.get('/:id/bill', auth, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only the order owner or an admin can download the bill
        if (order.user_id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this bill' });
        }

        // Set Headers for PDF Download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="bill_${order._id}.pdf"`);

        // Generate and stream the PDF
        generateOrderPdf(
            order,
            (chunk) => res.write(chunk), // Data callback
            () => res.end() // End callback
        );

    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).json({ message: 'Error generating bill' });
    }
});

module.exports = router;
