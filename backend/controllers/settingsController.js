const User = require('../models/User');
const https = require('https');

exports.getSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('googleAdsConfig');
    const config = user.googleAdsConfig || {};
    res.json({
      clientId: config.clientId || '',
      clientSecret: config.clientSecret ? '••••••' + config.clientSecret.slice(-6) : '',
      developerToken: config.developerToken ? '••••••' + config.developerToken.slice(-4) : '',
      refreshToken: config.refreshToken ? '••••••' + config.refreshToken.slice(-8) : '',
      managerAccountId: config.managerAccountId || '',
      isConfigured: config.isConfigured || false,
      hasClientSecret: !!config.clientSecret,
      hasDeveloperToken: !!config.developerToken,
      hasRefreshToken: !!config.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    const { clientId, clientSecret, developerToken, managerAccountId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.googleAdsConfig) user.googleAdsConfig = {};

    if (clientId !== undefined) user.googleAdsConfig.clientId = clientId;
    if (clientSecret && !clientSecret.startsWith('••')) user.googleAdsConfig.clientSecret = clientSecret;
    if (developerToken && !developerToken.startsWith('••')) user.googleAdsConfig.developerToken = developerToken;
    if (managerAccountId !== undefined) user.googleAdsConfig.managerAccountId = managerAccountId.replace(/-/g, '');

    const cfg = user.googleAdsConfig;
    cfg.isConfigured = !!(cfg.clientId && cfg.clientSecret && cfg.developerToken && cfg.refreshToken && cfg.managerAccountId);

    await user.save();

    res.json({ message: 'Settings saved', isConfigured: cfg.isConfigured });
  } catch (error) {
    next(error);
  }
};

exports.generateAuthUrl = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const cfg = user.googleAdsConfig;

    if (!cfg?.clientId || !cfg?.clientSecret) {
      return res.status(400).json({ message: 'Save Client ID and Client Secret first' });
    }

    const redirectUri = `${req.protocol}://${req.get('host')}/api/settings/oauth-callback`;
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/adwords',
      access_type: 'offline',
      prompt: 'consent',
      state: user._id.toString(),
    });

    res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
  } catch (error) {
    next(error);
  }
};

exports.handleOAuthCallback = async (req, res) => {
  const { code, state: userId } = req.query;

  if (!code || !userId) {
    return res.status(400).send('<h1>Error: Missing code or state</h1>');
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).send('<h1>User not found</h1>');

    const cfg = user.googleAdsConfig;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/settings/oauth-callback`;

    const postData = new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }).toString();

    const tokens = await new Promise((resolve, reject) => {
      const tokenReq = https.request({
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
        },
      }, (tokenRes) => {
        let data = '';
        tokenRes.on('data', (chunk) => { data += chunk; });
        tokenRes.on('end', () => resolve(JSON.parse(data)));
      });
      tokenReq.on('error', reject);
      tokenReq.write(postData);
      tokenReq.end();
    });

    if (tokens.refresh_token) {
      user.googleAdsConfig.refreshToken = tokens.refresh_token;
      const c = user.googleAdsConfig;
      c.isConfigured = !!(c.clientId && c.clientSecret && c.developerToken && c.refreshToken && c.managerAccountId);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h1 style="color:#22c55e">Refresh Token Generated!</h1>
        <p>Your Google Ads connection is ready.</p>
        <p><a href="${frontendUrl}/settings" style="color:#2563eb">Go back to Settings</a></p>
        <script>setTimeout(()=>window.location='${frontendUrl}/settings',3000)</script>
      </body></html>`);
    } else {
      res.send(`<html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h1 style="color:#ef4444">Error</h1>
        <pre>${JSON.stringify(tokens, null, 2)}</pre>
      </body></html>`);
    }
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><pre>${error.message}</pre>`);
  }
};
