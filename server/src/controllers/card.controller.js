import Card from '../models/Card.js';
import Account from '../models/Account.js';
import { createNotification } from './notification.controller.js';

export const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user._id }).populate('account', 'number balance');
    res.json({ cards });
  } catch (err) {
    next(err);
  }
};

export const applyForCard = async (req, res, next) => {
  try {
    const account = await Account.findOne({ user: req.user._id, isActive: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const {
      cardType = 'visa',
      cardName = 'EverestSave Card',
      isVirtual = false,
      spendingLimit,
      color = '#C9A84C',
    } = req.body;

    const expiry = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear() + 4 - 2000}`;
    const lastFour = Math.floor(1000 + Math.random() * 9000).toString();

    const card = await Card.create({
      user: req.user._id,
      account: account._id,
      lastFour,
      cardType,
      cardName,
      expiry,
      isVirtual,
      spendingLimit: spendingLimit || undefined,
      color,
      status: 'pending',
    });

    await createNotification(req.user._id, {
      title: 'Card Application Received',
      body: `Your ${cardType.charAt(0).toUpperCase() + cardType.slice(1)} card application is under review. We'll notify you once approved.`,
      type: 'card',
      icon: 'ti-credit-card',
      iconColor: '#C9A84C',
    });

    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
};

export const issueVirtualCard = async (req, res, next) => {
  try {
    const account = await Account.findOne({ user: req.user._id, isActive: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });

    const expiry = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear() + 3 - 2000}`;
    const lastFour = Math.floor(1000 + Math.random() * 9000).toString();

    const card = await Card.create({
      user: req.user._id,
      account: account._id,
      lastFour,
      cardName: req.body.cardName || 'Virtual Card',
      expiry,
      isVirtual: true,
      status: 'pending',
    });

    await createNotification(req.user._id, {
      title: 'Virtual Card Pending',
      body: `Your virtual card request is pending review. We'll notify you once it's approved.`,
      type: 'card',
      icon: 'ti-credit-card',
      iconColor: '#C9A84C',
    });

    res.status(201).json({ card });
  } catch (err) {
    next(err);
  }
};

export const toggleFreeze = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user._id });
    if (!card) return res.status(404).json({ message: 'Card not found' });

    card.isFrozen = !card.isFrozen;
    await card.save();

    await createNotification(req.user._id, {
      title: card.isFrozen ? 'Card Frozen' : 'Card Unfrozen',
      body: `Your card ending in ${card.lastFour} has been ${card.isFrozen ? 'frozen' : 'unfrozen'}.`,
      type: 'security',
      icon: card.isFrozen ? 'ti-snowflake' : 'ti-flame',
      iconColor: card.isFrozen ? '#5B9BD5' : '#C9A84C',
    });

    res.json({ card });
  } catch (err) {
    next(err);
  }
};

export const updateSpendingLimit = async (req, res, next) => {
  try {
    const { limit } = req.body;
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { spendingLimit: limit },
      { new: true }
    );
    if (!card) return res.status(404).json({ message: 'Card not found' });
    res.json({ card });
  } catch (err) {
    next(err);
  }
};
