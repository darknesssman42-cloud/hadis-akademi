const axios = require('axios');
require('dotenv').config();

async function testLogin() {
    try {
        const port = process.env.PORT || 5000;
        const res = await axios.post(`http://localhost:${port}/api/auth/login`, {
            email: 'admin@hadis.com',
            password: '123456'
        });
        console.log('Login Success!');
        console.log('Token:', res.data.token.substring(0, 20) + '...');
        console.log('User Role:', res.data.user.role);
    } catch (err) {
        console.error('Login Failed!');
        console.error('Status:', err.response?.status);
        console.error('Error:', err.response?.data?.error);
    }
}

testLogin();
