const nodemailer = require('nodemailer');

const sendVerificationEmail = async (email, code) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 465, // Try SSL port
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Add connection timeout setting explicitly
            connectionTimeout: 10000,
            logger: true,
            debug: true,
            secure: true,
            socketTimeout: 10000, // Add socket timeout
            dnsTimeout: 5000, // Add dns timeout
            family: 4, // Force IPv4
            tls: {
                rejectUnauthorized: false
            }
        });

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

module.exports = { sendVerificationEmail };
