const router = require('express').Router();
const nodemailer = require('nodemailer');

router.get('/email', async (req, res) => {
    try {
        const { to } = req.query;
        if (!to) {
            return res.status(400).json({ message: "Please provide a 'to' email parameter" });
        }

        // define transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // use STARTTLS
            family: 4, // Force IPv4
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Test configuration
        const configTest = {
            user: process.env.EMAIL_USER ? `Set (${process.env.EMAIL_USER.substring(0, 3)}...)` : 'NOT SET',
            pass: process.env.EMAIL_PASS ? `Set (Length: ${process.env.EMAIL_PASS.length})` : 'NOT SET',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            family: 4
        };

        console.log("Debug Email Config:", configTest);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: 'Test Email from Debug Route',
            text: 'If you are reading this, your email configuration is working!',
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            message: "Email sent successfully",
            info: info,
            config: configTest
        });

    } catch (error) {
        console.error("Debug Email Error:", error);
        res.status(500).json({
            message: "Email sending failed",
            error: error.message,
            stack: error.stack,
            config: {
                user: process.env.EMAIL_USER ? `Set (${process.env.EMAIL_USER.substring(0, 3)}...)` : 'NOT SET',
                pass: process.env.EMAIL_PASS ? `Set (Length: ${process.env.EMAIL_PASS.length})` : 'NOT SET'
            }
        });
    }
});

// Version 2 Route to force-bypassing cache
router.get('/email-v2', async (req, res) => {
    // Exact same logic as above
    try {
        const { to } = req.query;
        if (!to) return res.status(400).json({ message: "Provide 'to' param" });

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            family: 4,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const configTest = {
            version: 'V2 - FORCE UPDATE',
            user: process.env.EMAIL_USER ? "Set" : "Not Set",
            host: 'smtp.gmail.com',
            port: 587
        };

        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'V2 Debug Email',
            text: 'It works!'
        });

        res.json({ message: "V2 Email Sent", info, config: configTest });
    } catch (error) {
        res.status(500).json({
            message: "V2 Failed",
            error: error.message,
            config: { version: 'V2', host: 'smtp.gmail.com', port: 587 }
        });
    }
});

const dns = require('dns');
const net = require('net');

router.get('/network-test', (req, res) => {
    const results = {
        dns: 'pending',
        tcp_587: 'pending',
        tcp_465: 'pending'
    };

    // 1. Check DNS
    dns.resolve4('smtp.gmail.com', (err, addresses) => {
        if (err) {
            results.dns = { error: err.message };
            return finish();
        }
        results.dns = { ips: addresses };

        // 2. Check TCP 587
        const sock587 = new net.Socket();
        sock587.setTimeout(3000);
        sock587.on('connect', () => {
            results.tcp_587 = "Success";
            sock587.destroy();
            check465();
        });
        sock587.on('error', (e) => {
            results.tcp_587 = { error: e.message };
            check465();
        });
        sock587.on('timeout', () => {
            results.tcp_587 = { error: 'Timeout' };
            sock587.destroy();
            check465();
        });
        sock587.connect(587, 'smtp.gmail.com');
    });

    function check465() {
        const sock465 = new net.Socket();
        sock465.setTimeout(3000);
        sock465.on('connect', () => {
            results.tcp_465 = "Success";
            sock465.destroy();
            finish();
        });
        sock465.on('error', (e) => {
            results.tcp_465 = { error: e.message };
            finish();
        });
        sock465.on('timeout', () => {
            results.tcp_465 = { error: 'Timeout' };
            sock465.destroy();
            finish();
        });
        sock465.connect(465, 'smtp.gmail.com');
    }

    function finish() {
        if (!res.headersSent) {
            res.json(results);
        }
    }
});

module.exports = router;
