const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function runTest() {
    try {
        console.log("1. Logging in as Visual Doctor...");
        const loginRes = await axios.post(`${API_URL}/login`, {
            email: "vis_doc@test.com", password: "password123"
        });
        const token = loginRes.data.token;
        console.log("   Logged in.");

        console.log("2. Fetching Appointments...");
        const res = await axios.get(`${API_URL}/api/appointments/my-appointments`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log("3. Inspecting Data...");
        if (res.data.length === 0) {
            console.log("   No appointments found. Please ensure seed_and_book.js ran.");
            return;
        }

        const appt = res.data[0];
        console.log("   First Appointment Record:");
        console.log(JSON.stringify(appt, null, 2));

        if (appt.patientId && appt.patientId.name) {
            console.log("✅ SUCCESS: patientId was populated with name: " + appt.patientId.name);
        } else {
            console.error("❌ FAILURE: patientId not populated or name missing.");
        }

    } catch (error) {
        console.error("❌ TEST FAILED:", error.response ? error.response.data : error.message);
    }
}

runTest();
