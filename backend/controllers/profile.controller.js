const User = require('../models/User');

// GET /api/profile/me  (protected)
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username email createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile', error: err.message });
  }
};
