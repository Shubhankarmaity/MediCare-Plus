const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5179';

async function testBackend() {
    console.log('\n--- STARTING HEADLESS VERIFICATION ---\n');

    // 1. Check Frontend Availability
    try {
        console.log(`[1/4] Checking Frontend at ${FRONTEND_URL}...`);
        const feRes = await axios.get(FRONTEND_URL);
        console.log(`✅ Frontend is reachable (Status: ${feRes.status}).`);
    } catch (err) {
        console.error(`❌ Frontend check failed: ${err.message}`);
    }

    // 2. Check Backend Root/Health
    try {
        console.log(`\n[2/4] Checking Backend Health at ${BACKEND_URL}...`);
        // Often root returns 404 on API servers, so we might expect that or a Welcome message. 
        // Let's try to just connect.
        try {
            await axios.get(BACKEND_URL);
            console.log(`✅ Backend is reachable.`);
        } catch (err) {
            // 404 is actually "good" because it means the server responded
            if (err.response && err.response.status === 404) {
                console.log(`✅ Backend is reachable (responded with 404 as expected for root).`);
            } else {
                throw err;
            }
        }
    } catch (err) {
        console.error(`❌ Backend connection failed: ${err.message}`);
        return; // Stop if backend is down
    }

    // 3. Test Login
    let token;
    try {
        console.log(`\n[3/4] Testing Login...`);
        const loginRes = await axios.post(`${BACKEND_URL}/login`, {
            email: "vis_doc@test.com",
            password: "password123"
        });

        if (loginRes.data.token) {
            token = loginRes.data.token;
            console.log(`✅ Login Successful! Token received.`);
            console.log(`   User: ${loginRes.data.user.name} (${loginRes.data.user.role})`);
        } else {
            console.error(`❌ Login failed: No token returned.`);
            return;
        }
    } catch (err) {
        console.error(`❌ Login failed: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
        return;
    }

    // 4. Test Protected Route
    try {
        console.log(`\n[4/4] Testing Protected API Route...`);
        const dataRes = await axios.get(`${BACKEND_URL}/api/appointments/my-appointments`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (dataRes.status === 200) {
            console.log(`✅ Protected API access successful!`);
            console.log(`   Appointments found: ${dataRes.data.length}`);
        }
    } catch (err) {
        console.error(`❌ Protected route failed: ${err.response ? JSON.stringify(err.response.data) : err.message}`);
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

testBackend();
