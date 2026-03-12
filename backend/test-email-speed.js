require('dotenv').config();
const { sendVerificationEmail } = require('./utils/emailService');

async function testSpeed() {
    console.log('--- Starting Email Speed Test ---');
    const email = 'monishnarain2006@gmail.com'; // Testing with your email
    const start = Date.now();

    console.log('Sending first email...');
    const res1 = await sendVerificationEmail(email, '111111');
    const mid1 = Date.now();
    console.log(`Email 1 took: ${mid1 - start}ms`);

    console.log('Sending second email (should reuse connection)...');
    const res2 = await sendVerificationEmail(email, '222222');
    const mid2 = Date.now();
    console.log(`Email 2 took: ${mid2 - mid1}ms`);

    console.log('Sending third email (should be very fast)...');
    const res3 = await sendVerificationEmail(email, '333333');
    const end = Date.now();
    console.log(`Email 3 took: ${end - mid2}ms`);

    console.log('--- Summary ---');
    console.log(`Total duration: ${end - start}ms`);
    console.log(`Average per email: ${(end - start) / 3}ms`);

    // Give some time for pooled connections to settle before exiting
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Error: EMAIL_USER or EMAIL_PASS not found in .env');
    process.exit(1);
}

testSpeed();
