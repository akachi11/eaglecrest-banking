import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import Recipient from '../models/Recipient.js';
import { createNotification } from './notification.controller.js';

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

export const sendTransfer = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { recipientId, amount, note } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' });
    }

    const account = await Account.findOne({ user: req.user._id, isActive: true }).session(session);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (account.balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    const recipient = await Recipient.findOne({ _id: recipientId, user: req.user._id }).session(session);
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

    account.balance -= amount;
    await account.save({ session });

    const txn = await Transaction.create(
      [
        {
          account: account._id,
          user: req.user._id,
          name: recipient.name,
          category: 'Transfer',
          amount,
          type: 'debit',
          status: 'completed',
          date: new Date(),
          note,
          reference: generateRef(),
          icon: 'ti-send',
          iconBg: 'rgba(91,155,213,0.12)',
          iconColor: '#5B9BD5',
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await createNotification(req.user._id, {
      title: 'Transfer Sent',
      body: `$${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} sent to ${recipient.name}${note ? ` · "${note}"` : ''}.`,
      type: 'transfer',
      icon: 'ti-send',
      iconColor: '#5B9BD5',
    });

    res.status(201).json({ transaction: txn[0], balance: account.balance });
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

export const getRecipients = async (req, res, next) => {
  try {
    const recipients = await Recipient.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ recipients });
  } catch (err) {
    next(err);
  }
};

export const addRecipient = async (req, res, next) => {
  try {
    const { name, handle, bank, accountNumber, routingNumber } = req.body;
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const recipient = await Recipient.create({
      user: req.user._id,
      name,
      handle,
      initials,
      bank,
      accountNumber,
      routingNumber,
    });
    res.status(201).json({ recipient });
  } catch (err) {
    next(err);
  }
};

export const deleteRecipient = async (req, res, next) => {
  try {
    const recipient = await Recipient.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
    res.json({ message: 'Recipient removed' });
  } catch (err) {
    next(err);
  }
};
