const Account = require('../models/Account');
const Campaign = require('../models/Campaign');
const Performance = require('../models/Performance');
const User = require('../models/User');
const googleAdsService = require('../services/googleAdsService');

async function getUserCredentials(userId) {
  const user = await User.findById(userId).select('googleAdsConfig');
  if (user?.googleAdsConfig?.isConfigured) {
    return user.googleAdsConfig;
  }
  return {};
}

const monitoringJob = {
  async run() {
    const warmupAccounts = await Account.find({
      status: 'warmup',
      googleAdsCustomerId: { $ne: null },
    });

    console.log(`[MONITOR] Found ${warmupAccounts.length} warmup accounts to monitor`);

    for (const account of warmupAccounts) {
      try {
        const credentials = await getUserCredentials(account.createdBy);

        const campaigns = await Campaign.find({
          account: account._id,
          status: 'active',
          googleCampaignId: { $ne: null },
        });

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        for (const campaign of campaigns) {
          try {
            const perfData = await googleAdsService.getCampaignPerformance(
              account.googleAdsCustomerId,
              campaign.googleCampaignId,
              yesterday,
              today,
              credentials
            );

            for (const dayData of perfData) {
              await Performance.findOneAndUpdate(
                {
                  account: account._id,
                  campaign: campaign._id,
                  date: new Date(dayData.date),
                },
                {
                  impressions: dayData.impressions,
                  clicks: dayData.clicks,
                  spend: dayData.spend,
                  ctr: dayData.ctr,
                  avgCpc: dayData.avgCpc,
                  conversions: dayData.conversions,
                },
                { upsert: true, new: true }
              );
            }

            console.log(`[MONITOR] Updated performance for campaign ${campaign.campaignName}`);
          } catch (error) {
            console.error(`[MONITOR] Error monitoring campaign ${campaign._id}:`, error.message);
          }
        }

        if (account.warmupStartDate) {
          const daysSinceStart = Math.floor(
            (Date.now() - new Date(account.warmupStartDate).getTime()) / 86400000
          );
          if (daysSinceStart >= 14) {
            account.status = 'active';
            account.warmupEndDate = new Date();
            await account.save();
            console.log(`[MONITOR] Account ${account.accountName} warmup completed`);
          }
        }
      } catch (error) {
        console.error(`[MONITOR] Error processing account ${account._id}:`, error.message);
      }
    }
  },
};

module.exports = monitoringJob;
