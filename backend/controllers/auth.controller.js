const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/email');

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

function signToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

// POST /api/auth/signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'Email is already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashed,
      otp,
      otpExpiry: Date.now() + OTP_TTL_MS,
      otpPurpose: 'signup',
    });

    await sendOTPEmail(user.email, otp, 'signup');
    res.status(201).json({
      message: 'Signup successful. An OTP has been sent to your email for verification.',
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

// POST /api/auth/verify-otp   body: { email, otp, purpose }
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (
      !user.otp ||
      user.otpPurpose !== purpose ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (purpose === 'signup') user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = null;
    await user.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed', error: err.message });
  }
};

// POST /api/auth/signin
exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });
    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before signing in' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Signin failed', error: err.message });
  }
};

// POST /api/auth/forgot-password  body: { email }
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_TTL_MS;
    user.otpPurpose = 'reset';
    await user.save();

    await sendOTPEmail(user.email, otp, 'reset');
    res.json({ message: 'An OTP has been sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Request failed', error: err.message });
  }
};

// POST /api/auth/reset-password  body: { email, otp, newPassword }
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({ email: (email || '').toLowerCase() });
    if (
      !user ||
      user.otpPurpose !== 'reset' ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = null;
    await user.save();

    res.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (err) {
    res.status(500).json({ message: 'Reset failed', error: err.message });
  }
};

// POST /api/auth/request-change-password  (protected - sends OTP to logged-in user's email)
exports.requestChangePassword = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = Date.now() + OTP_TTL_MS;
    user.otpPurpose = 'change-password';
    await user.save();

    await sendOTPEmail(user.email, otp, 'change-password');
    res.json({ message: 'An OTP has been sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Request failed', error: err.message });
  }
};

// POST /api/auth/change-password  (protected)  body: { otp, newPassword }
exports.changePassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.userId);
    if (
      !user ||
      user.otpPurpose !== 'change-password' ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry.getTime() < Date.now()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpPurpose = null;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Change password failed', error: err.message });
  }
};
