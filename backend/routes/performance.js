const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getPerformanceByAccount,
  getPerformanceSummary,
  getOverallPerformance,
} = require('../controllers/performanceController');

router.use(auth);

router.get('/overall', getOverallPerformance);
router.get('/:accountId', getPerformanceByAccount);
router.get('/:accountId/summary', getPerformanceSummary);

module.exports = router;
