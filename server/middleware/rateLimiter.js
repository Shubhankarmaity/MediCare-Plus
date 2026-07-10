const rateLimit = require('express-rate-limit');

// General auth limiter — login, register (10 requests per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    },
    skipSuccessfulRequests: false,
});

// OTP limiter — forgot-password, resend-otp, verify-email (5 per 10 minutes)
const otpLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many OTP requests. Please wait 10 minutes before trying again.'
    },
});

// Strict limiter for password reset (3 per 30 minutes)
const resetPasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many password reset attempts. Please wait 30 minutes.'
    },
});

module.exports = { authLimiter, otpLimiter, resetPasswordLimiter };
