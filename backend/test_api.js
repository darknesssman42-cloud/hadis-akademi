const axios = require('axios');

const tryLogin = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@hadis',
            password: '123456'
        });
        console.log('Login success:', !!res.data.token);

        const resStats = await axios.get('http://localhost:5000/api/admin/stats', {
            headers: { Authorization: `Bearer ${res.data.token}` }
        });
        console.log('Stats status:', resStats.status);
        console.log('Stats data keys:', Object.keys(resStats.data));
    } catch (err) {
        console.error('API Error:', err.response?.status, err.response?.data || err.message);
    }
};

tryLogin();
