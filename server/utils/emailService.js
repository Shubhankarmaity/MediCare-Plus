const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

console.log("Email Service Config:", {
    user: process.env.EMAIL_USER ? "Set" : "Not Set",
    pass: process.env.EMAIL_PASS ? "Set" : "Not Set" 
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        // Mock Mode for Dev or Missing Credentials
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log("-----------------------------------------");
            console.log("📧 [MOCK EMAIL] - Missing Credentials");
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${text}`);
            console.log("-----------------------------------------");
            return { messageId: 'mock-id' };
        }

        const mailOptions = {
            from: `"MediCare Plus" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: text,
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email Sent successfully:', info.messageId);
        return info;

    } catch (error) {
        console.error('❌ Email Error:', error.message);
        // DO NOT THROW, just return null so app doesn't crash, but log it.
        return null;
    }
};

const sendOtpEmail = async (to, otp) => {
    const subject = 'Your OTP for MediCare Plus';
    const text = `Your OTP is: ${otp}. It is valid for 10 minutes.`;
    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0284c7;">MediCare Plus</h2>
      <p>Hello,</p>
      <p>Your verification code is below:</p>
      <h1 style="color: #0284c7; letter-spacing: 5px; background: #f0f9ff; padding: 10px; display: inline-block;">${otp}</h1>
      <p>This code expires in 10 minutes.</p>
      <hr style="border: 0; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888;">If you did not request this, please ignore this email.</p>
    </div>
  `;
    return await sendEmail(to, subject, text, html);
};

module.exports = { sendEmail, sendOtpEmail };
