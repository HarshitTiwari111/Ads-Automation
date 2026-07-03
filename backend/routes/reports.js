const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  generateReport,
  getReportsByAccount,
  getAllReports,
  getReport,
  exportCSV,
  exportPDF,
} = require('../controllers/reportController');

router.use(auth);

router.route('/').get(getAllReports).post(generateReport);
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);
router.get('/account/:accountId', getReportsByAccount);
router.get('/:id', getReport);

module.exports = router;
