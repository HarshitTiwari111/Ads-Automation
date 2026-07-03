const { GoogleAdsApi } = require('google-ads-api');

const getGoogleAdsClient = (credentials = {}) => {
  return new GoogleAdsApi({
    client_id: credentials.clientId || process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: credentials.clientSecret || process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: credentials.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
};

const getCustomer = (customerId, credentials = {}) => {
  const client = getGoogleAdsClient(credentials);
  return client.Customer({
    customer_id: customerId,
    refresh_token: credentials.refreshToken || process.env.GOOGLE_ADS_REFRESH_TOKEN,
    login_customer_id: credentials.managerAccountId || process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID,
  });
};

module.exports = { getGoogleAdsClient, getCustomer };
