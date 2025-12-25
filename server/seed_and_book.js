const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function seed() {
    try {
        const timestamp = Date.now();
        const patientCreds = { name: "Visual Patient", email: "vis_pat@test.com", password: "password123", role: "patient" };
        const doctorCreds = {
            name: "Visual Doctor", email: "vis_doc@test.com", password: "password123", role: "doctor",
            hospitalName: "Visual Hospital", specialization: "Optometry", experience: 10
        };

        console.log("1. Registering/Logging in Doctor...");
        let docId, docToken;
        try {
            await axios.post(`${API_URL}/register`, doctorCreds);
        } catch (e) { } // Ignore if exists

        const docLogin = await axios.post(`${API_URL}/login`, { email: doctorCreds.email, password: doctorCreds.password });
        docId = docLogin.data.result._id;
        docToken = docLogin.data.token;
        console.log("   Doctor Ready.");

        console.log("2. Registering/Logging in Patient...");
        let patToken;
        try {
            await axios.post(`${API_URL}/register`, patientCreds);
        } catch (e) { } // Ignore if exists

        const patLogin = await axios.post(`${API_URL}/login`, { email: patientCreds.email, password: patientCreds.password });
        patToken = patLogin.data.token;
        console.log("   Patient Ready.");

        console.log("3. Booking Appointment...");
        // Patient books Doctor
        await axios.post(`${API_URL}/api/appointments/book`, {
            doctorId: docId,
            date: new Date().toISOString()
        }, { headers: { Authorization: `Bearer ${patToken}` } });

        console.log("✅ Seeding Complete. Login as Doctor to verify.");
        console.log("   Email: vis_doc@test.com");
        console.log("   Pass:  password123");

    } catch (error) {
        console.error("❌ SEED FAILED:", error.message);
    }
}

seed();
