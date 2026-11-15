const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get user budgets for a given month and year (with spent calculation)
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({
      user: req.user._id,
      month,
      year,
    }).populate('category', 'name icon color type');

    // Calculate actual spent per category for that month & year
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const expenses = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: '$category',
          totalSpent: { $sum: '$amount' },
        },
      },
    ]);

    const spentMap = {};
    expenses.forEach((item) => {
      if (item._id) {
        spentMap[item._id.toString()] = item.totalSpent;
      }
    });

    const enrichedBudgets = budgets.map((b) => {
      const catId = b.category?._id ? b.category._id.toString() : b.category?.toString();
      const spent = spentMap[catId] || 0;
      const budgetAmount = b.limit || b.amount || 0;
      return {
        ...b.toObject(),
        limit: budgetAmount,
        amount: budgetAmount,
        spent,
        remaining: Math.max(0, budgetAmount - spent),
        percentage: budgetAmount > 0 ? Math.min(100, Math.round((spent / budgetAmount) * 100)) : 0,
      };
    });

    res.json(enrichedBudgets);
  } catch (error) {
    console.error('getBudgets error:', error);
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
};

// @desc    Create or update budget
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res) => {
  try {
    const { category, month, year, limit, amount } = req.body;
    const budgetLimit = limit !== undefined ? Number(limit) : Number(amount);

    if (!category || !month || !year || isNaN(budgetLimit)) {
      return res.status(400).json({ message: 'Category, month, year, and limit are required' });
    }

    let budget = await Budget.findOne({
      user: req.user._id,
      category,
      month: Number(month),
      year: Number(year),
    });

    if (budget) {
      budget.limit = budgetLimit;
      budget.amount = budgetLimit;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user._id,
        category,
        month: Number(month),
        year: Number(year),
        limit: budgetLimit,
        amount: budgetLimit,
      });
    }

    const populated = await Budget.findById(budget._id).populate('category', 'name icon color type');
    res.status(201).json(populated);
  } catch (error) {
    console.error('setBudget error:', error);
    res.status(500).json({ message: error.message || 'Server error setting budget' });
  }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    res.json({ message: 'Budget removed successfully' });
  } catch (error) {
    console.error('deleteBudget error:', error);
    res.status(500).json({ message: 'Server error deleting budget' });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
};