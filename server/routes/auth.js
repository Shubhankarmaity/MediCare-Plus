const router = require('express').Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// REGISTER
router.post('/register', authController.register);

// VERIFY EMAIL
router.post('/verify-email', authController.verifyEmail);

// RESEND OTP
router.post('/resend-otp', authController.resendOtp);

// FORGOT PASSWORD
router.post('/forgot-password', authController.forgotPassword);

// RESET PASSWORD
router.post('/reset-password', authController.resetPassword);

// LOGIN
router.post('/login', authController.login);

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