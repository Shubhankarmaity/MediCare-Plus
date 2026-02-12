const router = require('express').Router();
const { sendEmail } = require('../utils/emailService');

router.get('/email', async (req, res) => {
    try {
        const { to } = req.query;
        if (!to) return res.status(400).json({ message: "Provide 'to' param" });

        const result = await sendEmail(to, "Brevo Test", "This is a test via Brevo API", "<h1>It Works!</h1>");

        if (result) {
            res.json({ message: "Email Sent via Brevo", result });
        } else {
            res.status(500).json({ message: "Failed to send via Brevo (Check Logs)" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// V2 Route - Same as V1 now
router.get('/email-v2', async (req, res) => {
    try {
        const { to } = req.query;
        if (!to) return res.status(400).json({ message: "Provide 'to' param" });

        const result = await sendEmail(to, "Brevo V2 Test", "This is a V2 test via Brevo API", "<h1>V2 Works!</h1>");

        if (result) {
            res.json({ message: "V2 Email Sent via Brevo", result });
        } else {
            res.status(500).json({ message: "V2 Failed to send via Brevo (Check Logs)" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Keep network test for reference
// NEW: Test the exact OTP function
const { sendOtpEmail } = require('../utils/emailService');

router.get('/test-otp-format', async (req, res) => {
    try {
        const { to } = req.query;
        if (!to) return res.status(400).json({ message: "Provide 'to' param" });

        // Simulate a random OTP
        const testOtp = Math.floor(100000 + Math.random() * 900000).toString();

        console.log(`Testing OTP send to ${to} with code ${testOtp}`);
        const result = await sendOtpEmail(to, testOtp);

        if (result) {
            res.json({ message: "OTP Email Sent via Brevo", result, otpUsed: testOtp });
        } else {
            res.status(500).json({ message: "Failed to send OTP via Brevo (Check Logs)" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const dns = require('dns');
const net = require('net');

router.get('/network-test', async (req, res) => {
    const tests = [
        { host: 'smtp.gmail.com', port: 587 },
        { host: 'smtp.gmail.com', port: 465 },
        { host: 'smtp.gmail.com', port: 2525 }, // Alternative Gmail port
        { host: 'smtp.ethereal.email', port: 587 }, // Third-party SMTP
        { host: 'google.com', port: 80 } // General Internet
    ];

    const results = {};

    const checkConnection = (host, port) => {
        return new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(3000);
            const start = Date.now();

            socket.on('connect', () => {
                socket.destroy();
                resolve({ status: 'Success', time: Date.now() - start });
            });

            socket.on('error', (err) => {
                resolve({ status: 'Error', error: err.message, code: err.code });
            });

            socket.on('timeout', () => {
                socket.destroy();
                resolve({ status: 'Timeout' });
            });

            socket.connect(port, host);
        });
    };

    // Parallel execution
    for (const t of tests) {
        const key = `${t.host}:${t.port}`;
        results[key] = await checkConnection(t.host, t.port);
    }

    res.json(results);
});

module.exports = router;
