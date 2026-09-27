const router = require('express').Router();
const auth = require('../middleware/auth');
const { getProfile } = require('../controllers/profile.controller');

router.get('/me', auth, getProfile);

module.exports = router;
