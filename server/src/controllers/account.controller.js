import Account from '../models/Account.js';

export const getMyAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({ user: req.user._id, isActive: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ account });
  } catch (err) {
    next(err);
  }
};

export const getAllAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json({ accounts });
  } catch (err) {
    next(err);
  }
};
