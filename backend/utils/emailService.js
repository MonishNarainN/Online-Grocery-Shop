const nodemailer = require('nodemailer');

// Create a single transporter instance (Reverting pooling for reliability)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify connection configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Error:', error);
    } else {
        console.log('SMTP Server is ready to take our messages');
    }
});

const sendVerificationEmail = async (email, code) => {
    try {

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Friendly Grocer - Verify your email',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">Verify your Email Address</h2>
                    <p>Thank you for signing up with Friendly Grocer!</p>
                    <p>Please use the following code to verify your email address:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending email (FULL):', error);
        return { success: false, error: error.message || JSON.stringify(error) };
    }
};

const sendPasswordResetEmail = async (email, code) => {
    try {

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Friendly Grocer - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #f44336; text-align: center;">Reset Your Password</h2>
                    <p>We received a request to reset your Friendly Grocer password.</p>
                    <p>Please use the following code to reset your password:</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; border-left: 4px solid #f44336; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${code}</span>
                    </div>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message || JSON.stringify(error) };
    }
};

const sendAdminNotificationEmail = async (email, name, role) => {
    try {

        const isPromoted = role === 'admin';
        const subject = isPromoted
            ? 'Friendly Grocer - You are now an Admin!'
            : 'Friendly Grocer - Admin access revoked';

        const htmlContent = isPromoted ? `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">Congratulations, ${name}! 🎉</h2>
                <p>An owner has granted your account <strong>Administrative Privileges</strong> on Friendly Grocer.</p>
                <div style="background-color: #f4f4f4; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                    <p style="margin: 0;"><strong>What you can do now:</strong></p>
                    <ul style="margin-top: 10px; padding-left: 20px;">
                        <li>Manage product inventory and stock</li>
                        <li>Update customer order statuses</li>
                        <li>Create and manage active promotions</li>
                        <li>Manage other user roles</li>
                    </ul>
                </div>
                <p>Please log out and log back in to access your new Admin Dashboard.</p>
                <p>Welcome to the team!</p>
            </div>
        ` : `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #f44336; text-align: center;">Account Update</h2>
                <p>Hi ${name},</p>
                <p>This is a notification that your <strong>Administrative Privileges</strong> on Friendly Grocer have been revoked by an owner.</p>
                <p>Your account has been reverted to a standard Customer account. You can still browse and purchase items as normal.</p>
                <p>If you believe this was a mistake, please contact support.</p>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending admin notification email:', error);
        return { success: false, error: error.message || JSON.stringify(error) };
    }
};

const sendOrderConfirmationEmail = async (email, name, order) => {
    try {

        // Generate items HTML
        const itemsHtml = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${item.name}</strong><br>
                    <small>Qty: ${item.quantity}</small>
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    ₹${(item.price * item.quantity).toFixed(2)}
                </td>
            </tr>
        `).join('');

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4CAF50; text-align: center;">Order Confirmation 🎉</h2>
                <p>Hi ${name || 'Customer'},</p>
                <p>Thank you for shopping with Friendly Grocer! We have received your order and payment successfully.</p>
                
                <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Order Summary (ID: ${order._id})</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td style="padding: 10px; font-weight: bold; text-align: right;">Total Paid:</td>
                                <td style="padding: 10px; font-weight: bold; text-align: right; color: #4CAF50;">₹${order.total_amount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div style="border-left: 4px solid #4CAF50; padding-left: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Shipping to:</strong></p>
                    <p style="margin-top: 5px; color: #555;">${order.shipping_address}</p>
                </div>

                <p>We'll notify you once your order is shipped!</p>
                <p>Thanks again,<br>The Friendly Grocer Team</p>
            </div>
        `;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Friendly Grocer - Order Confirmation',
            html: htmlContent
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', result.messageId);
        return { success: true };
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        return { success: false, error: error.message || JSON.stringify(error) };
    }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendAdminNotificationEmail, sendOrderConfirmationEmail };
