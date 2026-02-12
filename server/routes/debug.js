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
            pass: process.env.EMAIL_PASS ? `Set (Length: ${process.env.EMAIL_PASS.length})` : 'NOT SET'
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

module.exports = router;
