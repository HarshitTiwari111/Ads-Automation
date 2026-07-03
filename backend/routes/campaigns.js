const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCampaign,
  getCampaignsByAccount,
  getCampaign,
  updateCampaign,
  getAllCampaigns,
} = require('../controllers/campaignController');

router.use(auth);

router.route('/').get(getAllCampaigns).post(createCampaign);
router.get('/account/:accountId', getCampaignsByAccount);
router.route('/:id').get(getCampaign).put(updateCampaign);

module.exports = router;
