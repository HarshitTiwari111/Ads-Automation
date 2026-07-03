const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSettings, updateSettings, generateAuthUrl, handleOAuthCallback } = require('../controllers/settingsController');

router.get('/', auth, getSettings);
router.put('/', auth, updateSettings);
router.get('/oauth-url', auth, generateAuthUrl);
router.get('/oauth-callback', handleOAuthCallback);

module.exports = router;
