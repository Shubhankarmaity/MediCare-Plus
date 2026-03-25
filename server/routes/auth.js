const router = require('express').Router();
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');

// Input validation helpers
const validateRequired = (fields) => (req, res, next) => {
  for (const field of fields) {
    const value = req.body[field];
    if (typeof value !== 'string' || value.trim() === '') {
      return res.status(400).json({ message: `${field} is required` });
    }
  }
  next();
};

// REGISTER
router.post('/register', validateRequired(['name', 'email', 'password', 'role']), authController.register);

// VERIFY EMAIL
router.post('/verify-email', authController.verifyEmail);

// RESEND OTP
router.post('/resend-otp', authController.resendOtp);

// FORGOT PASSWORD
router.post('/forgot-password', authController.forgotPassword);

// RESET PASSWORD
router.post('/reset-password', authController.resetPassword);

// LOGIN
router.post('/login', validateRequired(['email', 'password']), authController.login);

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