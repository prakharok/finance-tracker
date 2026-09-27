const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // bcrypt hash, never returned masked-as-plaintext
    isVerified: { type: Boolean, default: false },
    // OTP fields reused for signup verification, password reset, and change-password confirmation
    otp: String,
    otpExpiry: Date,
    otpPurpose: { type: String, enum: ['signup', 'reset', 'change-password', null], default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
