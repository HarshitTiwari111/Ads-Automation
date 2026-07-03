const { getGoogleAdsClient, getCustomer } = require('../config/googleAds');
const { enums, services } = require('google-ads-api');

const isSimulation = () => process.env.SIMULATION_MODE === 'true';

function generateFakeId() {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateSimulatedPerformance(dateFrom, dateTo) {
  const data = [];
  const start = new Date(dateFrom);
  const end = new Date(dateTo);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const impressions = Math.floor(80 + Math.random() * 150);
    const clicks = Math.floor(impressions * (0.02 + Math.random() * 0.06));
    const spend = +(clicks * (2 + Math.random() * 5)).toFixed(2);
    data.push({
      date: formatDateForApi(new Date(d)),
      impressions,
      clicks,
      spend,
      ctr: impressions > 0 ? +((clicks / impressions) * 100).toFixed(2) : 0,
      avgCpc: clicks > 0 ? +(spend / clicks).toFixed(2) : 0,
      conversions: Math.floor(Math.random() * 3),
    });
  }
  return data;
}

const googleAdsService = {
  async createAccount(accountData, credentials = {}) {
    if (isSimulation()) {
      const fakeId = generateFakeId();
      console.log(`[SIMULATION] Created fake Google Ads account: ${fakeId}`);
      return fakeId;
    }

    const mccId = credentials.managerAccountId || process.env.GOOGLE_ADS_MANAGER_ACCOUNT_ID;
    const customer = getCustomer(mccId, credentials);
    const response = await customer.customers.createCustomerClient({
      customer_id: mccId,
      customer_client: {
        descriptive_name: accountData.accountName,
        currency_code: 'INR',
        time_zone: 'Asia/Kolkata',
      },
    });

    const resourceName = response?.resource_name;
    const customerId = resourceName ? resourceName.split('/').pop() : null;
    console.log(`Created Google Ads account: ${customerId}`);
    return customerId;
  },

  async createCampaignBudget(customerId, budgetAmountMicros, credentials = {}) {
    if (isSimulation()) {
      const resourceName = `customers/${customerId}/campaignBudgets/${generateFakeId()}`;
      console.log(`[SIMULATION] Created fake budget: ${resourceName}`);
      return resourceName;
    }

    const customer = getCustomer(customerId, credentials);
    const response = await customer.mutateResources([
      {
        entity: 'campaign_budget',
        operation: 'create',
        resource: {
          name: `Budget_${Date.now()}`,
          amount_micros: budgetAmountMicros,
          delivery_method: enums.BudgetDeliveryMethod.STANDARD,
        },
      },
    ]);
    return response.mutate_operation_responses[0].campaign_budget_result.resource_name;
  },

  async createCampaign(customerId, campaignData, budgetResourceName, credentials = {}) {
    if (isSimulation()) {
      const campaignId = generateFakeId();
      const resourceName = `customers/${customerId}/campaigns/${campaignId}`;
      console.log(`[SIMULATION] Created fake campaign: ${resourceName}`);
      return resourceName;
    }

    const customer = getCustomer(customerId, credentials);
    const response = await customer.mutateResources([
      {
        entity: 'campaign',
        operation: 'create',
        resource: {
          name: `${campaignData.name}_${Date.now()}`,
          advertising_channel_type: enums.AdvertisingChannelType.SEARCH,
          status: enums.CampaignStatus.PAUSED,
          campaign_budget: budgetResourceName,
          manual_cpc: { enhanced_cpc_enabled: false },
          network_settings: {
            target_google_search: true,
            target_search_network: false,
            target_content_network: false,
          },
          start_date: formatDateForApi(new Date()),
        },
      },
    ]);
    return response.mutate_operation_responses[0].campaign_result.resource_name;
  },

  async createAdGroup(customerId, campaignResourceName, adGroupData, credentials = {}) {
    if (isSimulation()) {
      const resourceName = `customers/${customerId}/adGroups/${generateFakeId()}`;
      console.log(`[SIMULATION] Created fake ad group: ${resourceName}`);
      return resourceName;
    }

    const customer = getCustomer(customerId, credentials);
    const response = await customer.mutateResources([
      {
        entity: 'ad_group',
        operation: 'create',
        resource: {
          name: adGroupData.name,
          campaign: campaignResourceName,
          type: enums.AdGroupType.SEARCH_STANDARD,
          cpc_bid_micros: adGroupData.cpcBidMicros || 1000000,
          status: enums.AdGroupStatus.ENABLED,
        },
      },
    ]);
    return response.mutate_operation_responses[0].ad_group_result.resource_name;
  },

  async enableCampaign(customerId, campaignResourceName, credentials = {}) {
    if (isSimulation()) {
      console.log(`[SIMULATION] Campaign enabled: ${campaignResourceName}`);
      return;
    }

    const customer = getCustomer(customerId, credentials);
    await customer.mutateResources([
      {
        entity: 'campaign',
        operation: 'update',
        resource: {
          resource_name: campaignResourceName,
          status: enums.CampaignStatus.ENABLED,
        },
      },
    ]);
    console.log(`Campaign enabled: ${campaignResourceName}`);
  },

  async getCampaignPerformance(customerId, campaignId, dateFrom, dateTo, credentials = {}) {
    if (isSimulation()) {
      console.log(`[SIMULATION] Generating performance data for campaign ${campaignId}`);
      return generateSimulatedPerformance(dateFrom, dateTo);
    }

    const customer = getCustomer(customerId, credentials);
    const results = await customer.report({
      entity: 'campaign',
      attributes: ['campaign.id', 'campaign.name', 'campaign.status'],
      metrics: [
        'metrics.impressions', 'metrics.clicks', 'metrics.cost_micros',
        'metrics.ctr', 'metrics.average_cpc', 'metrics.conversions',
      ],
      segments: ['segments.date'],
      from_date: dateFrom,
      to_date: dateTo,
      constraints: [{ key: 'campaign.id', op: '=', val: campaignId }],
    });

    return results.map((row) => ({
      date: row.segments.date,
      impressions: row.metrics.impressions,
      clicks: row.metrics.clicks,
      spend: row.metrics.cost_micros / 1000000,
      ctr: row.metrics.ctr * 100,
      avgCpc: row.metrics.average_cpc / 1000000,
      conversions: row.metrics.conversions,
    }));
  },

  async getAccountPerformance(customerId, dateFrom, dateTo, credentials = {}) {
    if (isSimulation()) {
      console.log(`[SIMULATION] Generating account performance for ${customerId}`);
      return generateSimulatedPerformance(dateFrom, dateTo);
    }

    const customer = getCustomer(customerId, credentials);
    const results = await customer.report({
      entity: 'customer',
      metrics: [
        'metrics.impressions', 'metrics.clicks', 'metrics.cost_micros',
        'metrics.ctr', 'metrics.average_cpc', 'metrics.conversions',
      ],
      segments: ['segments.date'],
      from_date: dateFrom,
      to_date: dateTo,
    });

    return results.map((row) => ({
      date: row.segments.date,
      impressions: row.metrics.impressions,
      clicks: row.metrics.clicks,
      spend: row.metrics.cost_micros / 1000000,
      ctr: row.metrics.ctr * 100,
      avgCpc: row.metrics.average_cpc / 1000000,
      conversions: row.metrics.conversions,
    }));
  },
};

module.exports = googleAdsService;
