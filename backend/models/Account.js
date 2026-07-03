const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  accountName: { type: String, required: true, trim: true },
  googleAdsCustomerId: { type: String, default: null },
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, trim: true },
  industry: { type: String, trim: true },
  website: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'created', 'warmup', 'active', 'paused', 'failed'],
    default: 'pending',
  },
  campaignTemplate: { type: String, default: 'warmup' },
  warmupStartDate: { type: Date, default: null },
  warmupEndDate: { type: Date, default: null },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Account', accountSchema);
