const Goal = require('../models/Goal');

// @route   GET /api/goals
// @desc    Get all goals for logged-in user
exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @route   POST /api/goals
// @desc    Create a new goal
exports.createGoal = async (req, res) => {
  try {
    const { title, targetAmount, savedAmount = 0, targetDate, category, color, icon, notes } = req.body;

    const initialSaved = Number(savedAmount) || 0;
    const history = initialSaved > 0 
      ? [{ amount: initialSaved, date: new Date(), note: 'Initial deposit' }]
      : [];

    const status = initialSaved >= Number(targetAmount) ? 'completed' : 'active';

    const goal = await Goal.create({
      user: req.user._id,
      title,
      targetAmount: Number(targetAmount),
      savedAmount: initialSaved,
      targetDate,
      category: category || 'General',
      color: color || '#8B5CF6',
      icon: icon || 'Target',
      status,
      notes: notes || '',
      history
    });

    res.status(201).json({ success: true, goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   POST /api/goals/:id/deposit
// @desc    Add money / deposit towards a goal
exports.addDeposit = async (req, res) => {
  try {
    const { amount, note, date } = req.body;
    const depositAmount = Number(amount);

    if (!depositAmount || depositAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid deposit amount greater than 0' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(400).json({ success: false, message: 'Goal not found' });
    }

    goal.savedAmount = (goal.savedAmount || 0) + depositAmount;
    goal.history.unshift({
      amount: depositAmount,
      date: date ? new Date(date) : new Date(),
      note: note || ''
    });

    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();
    res.status(200).json({ success: true, goal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @route   PUT /api/goals/:id
// @desc    Update a goal
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { title, targetAmount, targetDate, category, color, icon, status, notes } = req.body;
    if (title !== undefined) goal.title = title;
    if (targetAmount !== undefined) goal.targetAmount = Number(targetAmount);
    if (targetDate !== undefined) goal.targetDate = targetDate;
    if (category !== undefined) goal.category = category;
    if (color !== undefined) goal.color = color;
    if (icon !== undefined) goal.icon = icon;
    if (notes !== undefined) goal.notes = notes;

    if (status) {
      goal.status = status;
    } else if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    } else if (goal.status === 'completed' && goal.savedAmount < goal.targetAmount) {
      goal.status = 'active';
    }

    await goal.save();
    res.status(200).json({ success: true, goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.status(200).json({ success: true, message: 'Goal removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};