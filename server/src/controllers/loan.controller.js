import Loan from '../models/Loan.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { createNotification } from './notification.controller.js';

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const getLoans = async (req, res, next) => {
  try {
    const loans = await Loan.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ loans });
  } catch (err) {
    next(err);
  }
};

export const applyForLoan = async (req, res, next) => {
  try {
    const { name, type, lender, principal, rate, termMonths } = req.body;
    const r = rate / 100 / 12;
    const n = termMonths;
    const monthlyPayment = r === 0
      ? principal / n
      : (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

    const nextDue = new Date();
    nextDue.setMonth(nextDue.getMonth() + 1);

    const loan = await Loan.create({
      user: req.user._id,
      name,
      type,
      lender,
      principal,
      balance: principal,
      rate,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      termMonths,
      nextDue,
      status: 'pending',
    });

    await createNotification(req.user._id, {
      title: 'Loan Application Received',
      body: `Your ${type} loan application for $${principal.toLocaleString()} is under review. We'll follow up within 1–2 business days.`,
      type: 'loan',
      icon: 'ti-receipt',
      iconColor: '#22c55e',
    });

    res.status(201).json({ loan });
  } catch (err) {
    next(err);
  }
};

export const makePayment = async (req, res, next) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, user: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    if (loan.status === 'paid_off') return res.status(400).json({ message: 'Loan already paid off' });
    if (loan.status === 'pending') return res.status(400).json({ message: 'Loan is still pending approval' });

    const account = await Account.findOne({ user: req.user._id, isActive: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    // The loan balance/next due date are not updated yet — a pending
    // transaction is recorded and an admin applies the payment manually.
    const txn = await Transaction.create({
      account: account._id,
      user: req.user._id,
      name: `${loan.name} Payment`,
      category: 'Loan Payment',
      amount: loan.monthlyPayment,
      type: 'debit',
      status: 'pending',
      date: new Date(),
      reference: generateRef(),
      icon: 'ti-receipt',
      iconBg: 'rgba(34,197,94,0.12)',
      iconColor: '#22c55e',
    });

    await createNotification(req.user._id, {
      title: 'Loan Payment Pending',
      body: `Your payment of $${loan.monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })} for ${loan.name} is pending review.`,
      type: 'loan',
      icon: 'ti-receipt',
      iconColor: '#22c55e',
    });

    res.json({ loan, transaction: txn });
  } catch (err) {
    next(err);
  }
};
