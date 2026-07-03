const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
  googleCampaignId: { type: String, default: null },
  campaignName: { type: String, required: true },
  campaignType: { type: String, enum: ['warmup', 'standard', 'custom'], default: 'warmup' },
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'paused', 'completed', 'failed'],
    default: 'draft',
  },
  dailyBudget: { type: Number, default: 1.00 },
  biddingStrategy: { type: String, default: 'MAXIMIZE_CLICKS' },
  targetLocations: [{ type: String }],
  keywords: [{ type: String }],
  adGroupName: { type: String },
  adHeadlines: [{ type: String }],
  adDescriptions: [{ type: String }],
  startDate: { type: Date },
  endDate: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
