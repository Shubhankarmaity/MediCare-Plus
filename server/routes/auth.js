const router = require('express').Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const { authLimiter, otpLimiter, resetPasswordLimiter } = require('../middleware/rateLimiter');

// REGISTER — 10 attempts per 15 minutes
router.post('/register', authLimiter, authController.register);

// VERIFY EMAIL — 5 attempts per 10 minutes
router.post('/verify-email', otpLimiter, authController.verifyEmail);

// RESEND OTP — 5 attempts per 10 minutes
router.post('/resend-otp', otpLimiter, authController.resendOtp);

// FORGOT PASSWORD — 5 attempts per 10 minutes
router.post('/forgot-password', otpLimiter, authController.forgotPassword);

// RESET PASSWORD — 3 attempts per 30 minutes
router.post('/reset-password', resetPasswordLimiter, authController.resetPassword);

// LOGIN — 10 attempts per 15 minutes
router.post('/login', authLimiter, authController.login);

// LOGOUT
router.post('/logout', authController.logout);

// UPDATE PROFILE
router.put('/profile', auth, authController.updateProfile);

// GET CURRENT USER PROFILE
router.get('/profile', auth, authController.getProfile);

// GRANT PROFILE ACCESS TO USER
router.post('/profile/grant-access/:targetUserId', auth, authController.grantProfileAccess);

// REVOKE PROFILE ACCESS FROM USER
router.delete('/profile/revoke-access/:targetUserId', auth, authController.revokeProfileAccess);

// GET PROFILE ACCESS LIST
router.get('/profile/access-list', auth, authController.getProfileAccessList);

module.exports = router;