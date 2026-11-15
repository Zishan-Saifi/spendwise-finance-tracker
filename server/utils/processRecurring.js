const Transaction = require('../models/Transaction');
const RecurringTransaction = require('../models/RecurringTransaction');

const processRecurringTransactions = async (userId) => {
  try {
    const today = new Date();

    // User ke wo sabhi active rules dhundo jinki nextRunDate aa chuki hai
    const dueRules = await RecurringTransaction.find({
      user: userId,
      status: 'active',
      nextRunDate: { $lte: today },
    });

    for (const rule of dueRules) {
      let runDate = new Date(rule.nextRunDate);

      // Agar multiple months miss hue hain, toh har month ki entry create karo
      while (runDate <= today) {
        await Transaction.create({
          user: rule.user,
          title: `${rule.title} (Recurring)`,
          amount: rule.amount,
          type: rule.type,
          category: rule.category,
          paymentMethod: rule.paymentMethod,
          date: new Date(runDate), // Sahi due date par transaction banti hai
          notes: `Auto-generated recurring ${rule.frequency} payment`,
        });

        // Next interval par advance karo
        if (rule.frequency === 'daily') {
          runDate.setDate(runDate.getDate() + 1);
        } else if (rule.frequency === 'weekly') {
          runDate.setDate(runDate.getDate() + 7);
        } else if (rule.frequency === 'monthly') {
          runDate.setMonth(runDate.getMonth() + 1);
        } else if (rule.frequency === 'yearly') {
          runDate.setFullYear(runDate.getFullYear() + 1);
        }
      }

      // Next due date database me update kar do
      rule.nextRunDate = runDate;
      await rule.save();
    }
  } catch (error) {
    console.error('Error processing recurring transactions:', error);
  }
};

module.exports = processRecurringTransactions;