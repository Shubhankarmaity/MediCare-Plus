/**
 * DEBUG ROUTES — Development Only
 * These routes are only loaded when NODE_ENV !== 'production' (see index.js).
 * They test email, OTP, and network connectivity.
 * NEVER expose these in production.
 */
const router = require('express').Router();
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { sendEmail, sendOtpEmail } = require('../utils/emailService');
const dns = require('dns');
const net = require('net');

// Guard: reject if somehow this file is mounted in production
router.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ message: 'Not found' });
    }
    next();
});

router.get('/email', auth, requireRole('super-admin', 'admin'), async (req, res) => {
    try {
        const { to } = req.query;
        if (!to) return res.status(400).json({ message: "Provide 'to' param" });

        const result = await sendEmail(to, 'Brevo Test', 'This is a test via Brevo API', '<h1>It Works!</h1>');

        if (result) {
            res.json({ message: 'Email Sent via Brevo', result });
        } else {
            res.status(500).json({ message: 'Failed to send via Brevo (Check Logs)' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/test-otp-format', auth, requireRole('super-admin', 'admin'), async (req, res) => {
    try {
        const { to } = req.query;
        if (!to) return res.status(400).json({ message: "Provide 'to' param" });

        const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const result = await sendOtpEmail(to, testOtp);

        if (result) {
            res.json({ message: 'OTP Email Sent via Brevo', result, otpUsed: testOtp });
        } else {
            res.status(500).json({ message: 'Failed to send OTP via Brevo (Check Logs)' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/network-test', auth, requireRole('super-admin'), async (req, res) => {
    const tests = [
        { host: 'smtp.gmail.com', port: 587 },
        { host: 'smtp.gmail.com', port: 465 },
        { host: 'google.com', port: 80 }
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

    for (const t of tests) {
        const key = `${t.host}:${t.port}`;
        results[key] = await checkConnection(t.host, t.port);
    }

    res.json(results);
});

module.exports = router;
