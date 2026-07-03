const Campaign = require('../models/Campaign');
const Account = require('../models/Account');

exports.createCampaign = async (req, res, next) => {
  try {
    const { accountId, campaignName, campaignType, dailyBudget, biddingStrategy, targetLocations, keywords, adGroupName, adHeadlines, adDescriptions } = req.body;

    const account = await Account.findOne({ _id: accountId, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    const campaign = await Campaign.create({
      account: accountId,
      campaignName,
      campaignType: campaignType || 'warmup',
      dailyBudget: dailyBudget || 1.00,
      biddingStrategy: biddingStrategy || 'MAXIMIZE_CLICKS',
      targetLocations: targetLocations || [],
      keywords: keywords || [],
      adGroupName: adGroupName || 'Default Ad Group',
      adHeadlines: adHeadlines || [],
      adDescriptions: adDescriptions || [],
      startDate: new Date(),
    });

    res.status(201).json(campaign);
  } catch (error) {
    next(error);
  }
};

exports.getCampaignsByAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ _id: req.params.accountId, createdBy: req.user.id });
    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }
    const campaigns = await Campaign.find({ account: req.params.accountId }).sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};

exports.getCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('account');
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    if (campaign.account.createdBy.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

exports.updateCampaign = async (req, res, next) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('account');
    if (!campaign || campaign.account.createdBy.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.getAllCampaigns = async (req, res, next) => {
  try {
    const userAccounts = await Account.find({ createdBy: req.user.id }).select('_id');
    const accountIds = userAccounts.map(a => a._id);
    const campaigns = await Campaign.find({ account: { $in: accountIds } })
      .populate('account', 'accountName clientName status')
      .sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (error) {
    next(error);
  }
};
