const RecurringTransaction = require('../models/RecurringTransaction');

// @route GET /api/recurring
// @desc Get all recurring rules for current user
exports.getRecurringRules = async (req, res) => {
  try {
    const rules = await RecurringTransaction.find({ user: req.user._id })
      .populate('category', 'name icon color type')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: rules.length, rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/recurring
// @desc Create a new recurring rule (e.g. Rent, Subscription)
exports.createRecurringRule = async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, frequency, startDate } = req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, type, and category are required',
      });
    }

    const start = startDate ? new Date(startDate) : new Date();

    const newRule = await RecurringTransaction.create({
      user: req.user._id,
      title,
      amount: Number(amount),
      type,
      category,
      paymentMethod: paymentMethod || 'Cash',
      frequency: frequency || 'monthly',
      startDate: start,
      nextRunDate: start, // Pehli due date start date se shuru hoti hai
      status: 'active',
    });

    const populated = await RecurringTransaction.findById(newRule._id).populate(
      'category',
      'name icon color type'
    );

    res.status(201).json({ success: true, rule: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/recurring/:id
// @desc Update recurring rule or toggle active/paused status
exports.updateRecurringRule = async (req, res) => {
  try {
    const rule = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Recurring rule not found' });
    }

    Object.assign(rule, req.body);
    await rule.save();

    const populated = await RecurringTransaction.findById(rule._id).populate(
      'category',
      'name icon color type'
    );

    res.json({ success: true, rule: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/recurring/:id
// @desc Delete a recurring rule
exports.deleteRecurringRule = async (req, res) => {
  try {
    const rule = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Recurring rule not found' });
    }

    await rule.deleteOne();
    res.json({ success: true, message: 'Recurring rule removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};