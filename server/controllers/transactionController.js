const Transaction = require('../models/Transaction');
const processRecurringTransactions = require('../utils/processRecurring');

// @route GET /api/transactions
exports.getTransactions = async (req, res) => {
  try {
    await processRecurringTransactions(req.user._id);
    const { type, category, startDate, endDate, search, sort } = req.query;
    let query = { user: req.user._id };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(new Date(endDate).setHours(23, 59, 59));
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { date: -1 };
    if (sort === 'oldest') sortOption = { date: 1 };
    if (sort === 'highest') sortOption = { amount: -1 };
    if (sort === 'lowest') sortOption = { amount: 1 };

    const transactions = await Transaction.find(query)
      .populate('category', 'name icon color type')
      .sort(sortOption);

    let totalIncome = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') totalIncome += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    res.json({
      success: true,
      count: transactions.length,
      summary: {
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense
      },
      transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/transactions
exports.createTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, paymentMethod, date, note } = req.body;
    if (!amount || !type || !category) {
      return res.status(400).json({ success: false, message: 'Amount, type, and category are required' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title: title || (type === 'income' ? 'Income' : 'Expense'),
      amount: Number(amount),
      type,
      category,
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
      note: note || ''
    });

    const populated = await Transaction.findById(transaction._id).populate('category', 'name icon color type');
    res.status(201).json({ success: true, transaction: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/transactions/:id
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    Object.assign(transaction, req.body);
    await transaction.save();

    const populated = await Transaction.findById(transaction._id).populate('category', 'name icon color type');
    res.json({ success: true, transaction: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/transactions/:id
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    await transaction.deleteOne();
    res.json({ success: true, message: 'Transaction removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};