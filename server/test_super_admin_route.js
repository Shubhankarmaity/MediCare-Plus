const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const API_URL = 'http://localhost:5000';
const SUPER_ADMIN_EMAIL = 'superadmin@hospital.com';
const SUPER_ADMIN_PASSWORD = 'superadmin123';

const testEndpoint = async () => {
    try {
        console.log("1. Logging in as Super Admin...");
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: SUPER_ADMIN_EMAIL,
            password: SUPER_ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        console.log("✅ Login Successful.");

        console.log("2. Fetching Hospitals...");
        const hospitalsRes = await axios.get(`${API_URL}/api/super-admin/hospitals`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (hospitalsRes.data.length === 0) {
            console.log("⚠️ No hospitals found to test.");
            return;
        }

        const hospitalId = hospitalsRes.data[0]._id;
        console.log(`✅ Found ${hospitalsRes.data.length} hospitals. Testing with ID: ${hospitalId}`);

        console.log(`3. Testing GET /api/super-admin/hospital/${hospitalId}/users ...`);
        try {
            const usersRes = await axios.get(`${API_URL}/api/super-admin/hospital/${hospitalId}/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("✅ Endpoint works! Response keys:", Object.keys(usersRes.data));
            console.log("Doctors count:", usersRes.data.doctors.length);
        } catch (err) {
            console.error("❌ Endpoint Failed:", err.response ? err.response.status : err.message);
            if (err.response && err.response.status === 404) {
                console.error("Diagnosis: The server returned 404. This DEFINITELY means the new code is not loaded.");
            }
        }

    } catch (err) {
        console.error("❌ Test Failed:", err.message);
        if (err.response) console.error("Response:", err.response.data);
    }
};

testEndpoint();
