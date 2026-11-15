const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecurringRules,
  createRecurringRule,
  updateRecurringRule,
  deleteRecurringRule,
} = require('../controllers/recurringController');

// All routes are JWT protected
router.use(protect);

router.route('/')
  .get(getRecurringRules)
  .post(createRecurringRule);

router.route('/:id')
  .put(updateRecurringRule)
  .delete(deleteRecurringRule);

module.exports = router;