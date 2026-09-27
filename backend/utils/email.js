const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const SUBJECTS = {
  signup: 'Verify your Finance Tracker account',
  reset: 'Reset your Finance Tracker password',
  'change-password': 'Confirm your password change',
};

async function sendOTPEmail(to, otp, purpose) {
  await transporter.sendMail({
    from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
    to,
    subject: SUBJECTS[purpose] || 'Your Finance Tracker OTP',
    html: `<p>Your one-time verification code is:</p>
           <h2 style="letter-spacing:4px">${otp}</h2>
           <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>`,
  });
}

module.exports = { sendOTPEmail };
