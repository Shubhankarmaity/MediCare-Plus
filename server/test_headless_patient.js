const axios = require('axios');

const API_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:5179';

async function verify() {
    console.log("--- STARTING VERIFICATION ---")

    // 1. Check Frontend
    try {
        await axios.get(FRONTEND_URL);
        console.log("✅ Frontend Reachable");
    } catch (e) {
        console.log("❌ Frontend Unreachable: " + e.message);
    }

    // 2. Register a Unique Patient
    const uniqueEmail = `test_pat_${Date.now()}@example.com`;
    const password = "password123";
    let token;
    let userId;

    console.log(`\n--- Backend Auth Test ---`);
    console.log(`Creating user: ${uniqueEmail}`);

    try {
        const regRes = await axios.post(`${API_URL}/register`, {
            name: "Test Patient",
            email: uniqueEmail,
            password: password,
            role: "patient"
        });
        console.log("✅ Registration Successful");
    } catch (e) {
        console.error("❌ Registration Failed:", e.response ? e.response.data : e.message);
        return;
    }

    // 3. Login
    try {
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: uniqueEmail,
            password: password
        });
        token = loginRes.data.token;
        userId = loginRes.data.result._id;
        console.log("✅ Login Successful (Token received)");
    } catch (e) {
        console.error("❌ Login Failed:", e.response ? e.response.data : e.message);
        return;
    }

    // 4. Test Protected API (Profile)
    try {
        const profileRes = await axios.get(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (profileRes.data.user.email === uniqueEmail) {
            console.log("✅ Protected Route (Profile) Verified");
            console.log("   User ID:", profileRes.data.user._id);
            console.log("   Role:", profileRes.data.user.role);
        } else {
            console.error("❌ Profile data mismatch");
        }
    } catch (e) {
        console.error("❌ Protected Route Failed:", e.response ? e.response.data : e.message);
    }

    console.log("\n--- VERIFICATION SUCCESS ---");
}

verify();
