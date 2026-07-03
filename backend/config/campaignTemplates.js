const campaignTemplates = {
  warmup: {
    name: 'Warm-up Campaign',
    budgetAmountMicros: 1000000, // $1/day in micros
    biddingStrategy: 'MAXIMIZE_CLICKS',
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: false,
      targetContentNetwork: false,
    },
    geoTargets: ['2356'], // India - change as needed
    adGroup: {
      name: 'Warm-up Ad Group',
      cpcBidMicros: 500000, // $0.50 max CPC
    },
  },
  standard: {
    name: 'Standard Campaign',
    budgetAmountMicros: 5000000, // $5/day
    biddingStrategy: 'TARGET_CPA',
    networkSettings: {
      targetGoogleSearch: true,
      targetSearchNetwork: true,
      targetContentNetwork: false,
    },
    geoTargets: ['2356'],
    adGroup: {
      name: 'Main Ad Group',
      cpcBidMicros: 1000000,
    },
  },
};

module.exports = campaignTemplates;
