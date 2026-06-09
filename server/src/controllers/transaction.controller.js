import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, status, category, startDate, endDate } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Transaction.countDocuments(filter),
    ]);

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

export const getTransaction = async (req, res, next) => {
  try {
    const txn = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ transaction: txn });
  } catch (err) {
    next(err);
  }
};

export const getCashFlow = async (req, res, next) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          date: { $gte: sixMonthsAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const cashFlow = {};

    result.forEach(({ _id, total }) => {
      const key = `${_id.year}-${_id.month}`;
      if (!cashFlow[key]) cashFlow[key] = { month: months[_id.month - 1], income: 0, expenses: 0 };
      if (_id.type === 'credit') cashFlow[key].income = total;
      else cashFlow[key].expenses = total;
    });

    res.json({ cashFlow: Object.values(cashFlow) });
  } catch (err) {
    next(err);
  }
};

export const getSpendingByCategory = async (req, res, next) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const result = await Transaction.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(req.user._id),
          type: 'debit',
          status: 'completed',
          date: { $gte: startOfMonth },
        },
      },
      { $group: { _id: '$category', amount: { $sum: '$amount' } } },
      { $sort: { amount: -1 } },
    ]);

    const total = result.reduce((sum, c) => sum + c.amount, 0);
    const spending = result.map((c) => ({
      name: c._id,
      amount: c.amount,
      percentage: total > 0 ? Math.round((c.amount / total) * 100) : 0,
    }));

    res.json({ spending, total });
  } catch (err) {
    next(err);
  }
};
