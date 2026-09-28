const SUBJECTS = {
  signup: 'Verify your Finance Tracker account',
  reset: 'Reset your Finance Tracker password',
  'change-password': 'Confirm your password change',
};

async function sendOTPEmail(to, otp, purpose) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Finance Tracker', email: process.env.EMAIL_USER },
        to: [{ email: to }],
        subject: SUBJECTS[purpose] || 'Your Finance Tracker OTP',
        htmlContent: `<p>Your one-time verification code is:</p>
          <h2 style="letter-spacing:4px">${otp}</h2>
          <p>This code expires in 10 minutes. If you didn't request this, ignore this email.</p>`,
      }),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Email API error ${res.status}: ${await res.text()}`);
    }
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { sendOTPEmail };