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
const dns = require('dns');
const net = require('net');

router.get('/network-test', async (req, res) => {
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
