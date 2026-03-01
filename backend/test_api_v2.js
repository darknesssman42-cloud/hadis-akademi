const tryLogin = async () => {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@hadis', password: '123456' })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', loginRes.status);
            return;
        }

        const loginData = await loginRes.json();
        console.log('Login success');

        const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });

        if (!statsRes.ok) {
            console.error('Stats failed:', statsRes.status, await statsRes.text());
            return;
        }

        const statsData = await statsRes.json();
        console.log('Stats keys:', Object.keys(statsData));
        console.log('Classrooms count:', statsData.totalClassrooms);
    } catch (err) {
        console.error('Error:', err.message);
    }
};

tryLogin();
