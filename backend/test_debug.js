async function testRegister() {
    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Debug User',
                email: 'debug' + Date.now() + '@test.com',
                password: 'password123'
            })
        });

        const status = response.status;
        const text = await response.text();

        console.log('Status:', status);
        console.log('Body:', text);

    } catch (err) {
        console.error('Request failed:', err);
    }
}

testRegister();
