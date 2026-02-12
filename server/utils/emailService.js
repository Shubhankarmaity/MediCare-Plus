const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log("Email Service Config:", {
    user: process.env.EMAIL_USER ? "Set" : "Not Set",
    pass: process.env.EMAIL_PASS ? "Set" : "Not Set"
});

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, text, html) => {
    try {
        // DEV MODE: If credentials assume mock mode
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.log("-----------------------------------------");
            console.log("📧 [MOCK EMAIL SERVICE] - Credentials Missing");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body (Text): ${text}`);
            console.log("-----------------------------------------");
            return { response: '250 OK (Mock)' };
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback to mock if real send fails (e.g. bad password)
        console.log("-----------------------------------------");
        console.log("📧 [EMAIL FAILED - FALLBACK LOG]");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body (Text): ${text}`);
        console.log("-----------------------------------------");
        return null; // Return null so we don't crash, but logged the OTP
    }
};

const sendOtpEmail = async (to, otp) => {
    const subject = 'Your OTP for MediCare Plus';
    const text = `Your OTP is: ${otp}. It is valid for 10 minutes.`;
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #0284c7;">MediCare Plus</h2>
      <p>Hello,</p>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <h1 style="color: #0284c7; letter-spacing: 5px;">${otp}</h1>
      <p>This OTP is valid for 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <br>
      <p>Best regards,</p>
      <p>The MediCare Plus Team</p>
    </div>
  `;
    return await sendEmail(to, subject, text, html);
};

module.exports = { sendEmail, sendOtpEmail };
