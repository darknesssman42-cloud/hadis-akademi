require('dotenv').config();

async function testLogin() {
    try {
        const port = process.env.PORT || 5000;
        const res = await fetch(`http://localhost:${port}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@hadis.com',
                password: '123456'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('Login Success!');
            console.log('Token:', data.token.substring(0, 20) + '...');
            console.log('User Role:', data.user.role);
        } else {
            console.log('Login Failed!');
            console.log('Status:', res.status);
            console.log('Error:', data.error);
        }
    } catch (err) {
        console.error('Fetch Error:', err.message);
    }
}

testLogin();
