const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createAccount,
  getAllAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  getDashboardStats,
  syncAccount,
} = require('../controllers/accountController');

router.use(auth);

router.get('/stats', getDashboardStats);
router.route('/').get(getAllAccounts).post(createAccount);
router.post('/:id/sync', syncAccount);
router.route('/:id').get(getAccount).put(updateAccount).delete(deleteAccount);

module.exports = router;
