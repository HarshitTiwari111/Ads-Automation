const Campaign = require('../models/Campaign');
const googleAdsService = require('./googleAdsService');
const campaignTemplates = require('../config/campaignTemplates');

const campaignService = {
  async createWarmupCampaign(account, credentials = {}) {
    const template = campaignTemplates.warmup;

    try {
      const campaign = await Campaign.create({
        account: account._id,
        campaignName: `${template.name} - ${account.accountName}`,
        campaignType: 'warmup',
        dailyBudget: template.budgetAmountMicros / 1000000,
        biddingStrategy: template.biddingStrategy,
        targetLocations: template.geoTargets,
        adGroupName: template.adGroup.name,
        status: 'pending',
        startDate: new Date(),
      });

      if (account.googleAdsCustomerId) {
        try {
          const budgetResource = await googleAdsService.createCampaignBudget(
            account.googleAdsCustomerId,
            template.budgetAmountMicros,
            credentials
          );

          const campaignResource = await googleAdsService.createCampaign(
            account.googleAdsCustomerId,
            template,
            budgetResource,
            credentials
          );

          await googleAdsService.createAdGroup(
            account.googleAdsCustomerId,
            campaignResource,
            template.adGroup,
            credentials
          );

          await googleAdsService.enableCampaign(
            account.googleAdsCustomerId,
            campaignResource,
            credentials
          );

          campaign.googleCampaignId = campaignResource.split('/').pop();
          campaign.status = 'active';
          await campaign.save();
        } catch (apiError) {
          campaign.status = 'failed';
          await campaign.save();
          throw apiError;
        }
      }

      return campaign;
    } catch (error) {
      console.error('Error creating warmup campaign:', error.message);
      throw error;
    }
  },
};

module.exports = campaignService;
