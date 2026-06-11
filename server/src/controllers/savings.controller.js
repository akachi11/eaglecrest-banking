import SavingsGoal from '../models/SavingsGoal.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { createNotification } from './notification.controller.js';

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const getGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ goals });
  } catch (err) {
    next(err);
  }
};

export const createGoal = async (req, res, next) => {
  try {
    const { name, icon, color, target, deadline } = req.body;
    const goal = await SavingsGoal.create({ user: req.user._id, name, icon, color, target, deadline });
    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
};

export const addFunds = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    const account = await Account.findOne({ user: req.user._id, isActive: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // The goal's saved amount is not updated yet — a pending transaction is
    // recorded and an admin applies the deposit manually.
    const txn = await Transaction.create({
      account: account._id,
      user: req.user._id,
      name: `${goal.name} Deposit`,
      category: 'Savings',
      amount,
      type: 'debit',
      status: 'pending',
      date: new Date(),
      reference: generateRef(),
      icon: goal.icon || 'ti-pig',
      iconBg: 'rgba(34,197,94,0.12)',
      iconColor: goal.color || '#22c55e',
    });

    await createNotification(req.user._id, {
      title: 'Savings Deposit Pending',
      body: `Your deposit of $${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} to ${goal.name} is pending review.`,
      type: 'system',
      icon: 'ti-pig',
      iconColor: '#22c55e',
    });

    res.json({ goal, transaction: txn });
  } catch (err) {
    next(err);
  }
};

export const deleteGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    next(err);
  }
};
