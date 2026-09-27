const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/auth.controller');

router.post('/signup', ctrl.signup);
router.post('/verify-otp', ctrl.verifyOtp);
router.post('/signin', ctrl.signin);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

// requires a valid JWT (user is already logged in and wants to change their password)
router.post('/request-change-password', auth, ctrl.requestChangePassword);
router.post('/change-password', auth, ctrl.changePassword);

module.exports = router;
