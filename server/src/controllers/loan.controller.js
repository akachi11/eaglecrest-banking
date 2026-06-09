import Loan from '../models/Loan.js';
import { createNotification } from './notification.controller.js';

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

    loan.balance = Math.max(0, loan.balance - loan.monthlyPayment);
    if (loan.balance === 0) loan.status = 'paid_off';

    const nextDue = new Date(loan.nextDue);
    nextDue.setMonth(nextDue.getMonth() + 1);
    loan.nextDue = nextDue;

    await loan.save();
    res.json({ loan });
  } catch (err) {
    next(err);
  }
};
