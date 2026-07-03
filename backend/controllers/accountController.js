const Account = require('../models/Account');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Performance = require('../models/Performance');
const Report = require('../models/Report');
const googleAdsService = require('../services/googleAdsService');
const campaignService = require('../services/campaignService');
const { sendStatusChangeEmail } = require('../services/emailService');

async function getUserCredentials(userId) {
  const user = await User.findById(userId).select('googleAdsConfig');
  if (user?.googleAdsConfig?.isConfigured) {
    return user.googleAdsConfig;
  }
  return {};
}

async function generateInitialPerformance(account, credentials) {
  const campaigns = await Campaign.find({
    account: account._id,
    status: 'active',
    googleCampaignId: { $ne: null },
  });

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dateFrom = sevenDaysAgo.toISOString().split('T')[0];
  const dateTo = today.toISOString().split('T')[0];

  for (const campaign of campaigns) {
    try {
      const perfData = await googleAdsService.getCampaignPerformance(
        account.googleAdsCustomerId,
        campaign.googleCampaignId,
        dateFrom,
        dateTo,
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

      console.log(`[INIT] Generated performance data for campaign ${campaign.campaignName}`);
    } catch (error) {
      console.error(`[INIT] Error generating performance for campaign ${campaign._id}:`, error.message);
    }
  }

  // Generate initial daily report
  const performances = await Performance.find({
    account: account._id,
    date: { $gte: sevenDaysAgo, $lte: today },
  });

  if (performances.length > 0) {
    const metrics = performances.reduce(
      (acc, p) => {
        acc.totalImpressions += p.impressions;
        acc.totalClicks += p.clicks;
        acc.totalSpend += p.spend;
        acc.totalConversions += p.conversions;
        return acc;
      },
      { totalImpressions: 0, totalClicks: 0, totalSpend: 0, avgCtr: 0, avgCpc: 0, totalConversions: 0 }
    );

    if (metrics.totalImpressions > 0) {
      metrics.avgCtr = (metrics.totalClicks / metrics.totalImpressions) * 100;
    }
    if (metrics.totalClicks > 0) {
      metrics.avgCpc = metrics.totalSpend / metrics.totalClicks;
    }

    await Report.create({
      account: account._id,
      reportType: 'daily',
      dateFrom: sevenDaysAgo,
      dateTo: today,
      metrics,
      status: 'ready',
      generatedBy: 'auto',
    });

    console.log(`[INIT] Generated initial report for ${account.accountName}`);
  }
}

exports.createAccount = async (req, res, next) => {
  try {
    const { accountName, clientName, clientEmail, industry, website, campaignTemplate } = req.body;

    const account = await Account.create({
      accountName,
      clientName,
      clientEmail,
      industry,
      website,
      campaignTemplate: campaignTemplate || 'warmup',
      createdBy: req.user.id,
    });

    const credentials = await getUserCredentials(req.user.id);

    try {
      const customerId = await googleAdsService.createAccount(account, credentials);
      account.googleAdsCustomerId = customerId;
      account.status = 'created';
      await account.save();

      await campaignService.createWarmupCampaign(account, credentials);
      account.status = 'warmup';
      account.warmupStartDate = new Date();
      await account.save();

      const creator = await User.findById(req.user.id).select('email');
      if (creator) {
        sendStatusChangeEmail(creator.email, account, 'pending', 'warmup').catch(() => {});
      }

      generateInitialPerformance(account, credentials).catch(err =>
        console.error('[INIT] Background performance generation failed:', err.message)
      );
    } catch (apiError) {
      const errorDetails = apiError.errors?.[0]?.message || apiError.message;
      console.error('Google Ads API error:', errorDetails);
      account.status = 'pending';
      account.notes = `API Error: ${errorDetails}. Manual setup required.`;
      await account.save();
    }

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
};

exports.syncAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const credentials = await getUserCredentials(req.user.id);
    await generateInitialPerformance(account, credentials);

    res.json({ message: 'Performance data synced and report generated' });
  } catch (error) {
    next(error);
  }
};

exports.getAllAccounts = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const filter = { createdBy: req.user.id };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { accountName: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
      ];
    }

    const accounts = await Account.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

exports.getAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.id, createdBy: req.user.id })
      .populate('createdBy', 'name email');
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json(account);
  } catch (error) {
    next(error);
  }
};

exports.updateAccount = async (req, res, next) => {
  try {
    const oldAccount = await Account.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!oldAccount) {
      return res.status(404).json({ message: 'Account not found' });
    }
    const oldStatus = oldAccount.status;

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (req.body.status && req.body.status !== oldStatus) {
      const user = await User.findById(req.user.id).select('email');
      if (user) {
        sendStatusChangeEmail(user.email, account, oldStatus, req.body.status).catch(() => {});
      }
    }

    res.json(account);
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    res.json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userFilter = { createdBy: req.user.id };
    const [total, pending, warmup, active, failed] = await Promise.all([
      Account.countDocuments(userFilter),
      Account.countDocuments({ ...userFilter, status: 'pending' }),
      Account.countDocuments({ ...userFilter, status: 'warmup' }),
      Account.countDocuments({ ...userFilter, status: 'active' }),
      Account.countDocuments({ ...userFilter, status: 'failed' }),
    ]);

    res.json({ total, pending, warmup, active, failed });
  } catch (error) {
    next(error);
  }
};
