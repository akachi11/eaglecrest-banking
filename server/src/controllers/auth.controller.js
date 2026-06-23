import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Account from '../models/Account.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

export const register = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phone, password,
      dob, street, city, state, zip, country,
      idType, ssnLast4,
      employmentStatus, employer, annualIncome,
      accountType, transactionPin,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name: `${firstName.trim()} ${lastName.trim()}`,
      email,
      password,
      phone,
      status: 'pending',
      dob: dob ? new Date(dob) : undefined,
      address: { street, city, state, zip, country: country || 'US' },
      idType,
      ssnLast4,
      employment: {
        status: employmentStatus,
        employer: employer || undefined,
        annualIncome: annualIncome ? Number(annualIncome) : undefined,
      },
      accountType: accountType || 'private',
      transactionPin,
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      applicationId: user._id,
    });
  } catch (err) {
    next(err);
  }
};

// Internal helper — activates a pending user and creates their account
// In production this would be a proper admin action
export const approveApplication = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.status === 'active') return res.status(400).json({ message: 'Already active' });

    user.status = 'active';
    await user.save();

    const { balance } = req.body;

    // Create the primary account when approved
    const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    await Account.create({
      user: user._id,
      number: accountNumber,
      type: user.accountType || 'private',
      balance: balance ? Number(balance) : 0,
      cardExpiry: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear() + 4 - 2000}`,
    });

    res.json({ message: 'Application approved', user });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Your application is under review. We\'ll notify you by email once it\'s approved — usually within 1–2 business days.',
        code: 'PENDING_APPLICATION',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'This account has been suspended. Please contact support.' });
    }

    const token = signToken(user._id);
    user.password = undefined;
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone },
      { new: true, runValidators: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

export const setTransactionPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!/^\d{4}$/.test(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    const user = await User.findById(req.user._id);
    user.transactionPin = pin;
    await user.save();

    res.json({ message: 'Transaction PIN set successfully', user });
  } catch (err) {
    next(err);
  }
};

export const changeTransactionPin = async (req, res, next) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
    }

    const user = await User.findById(req.user._id);
    if (!user.transactionPin) {
      return res.status(400).json({ message: 'No transaction PIN is set on this account' });
    }
    if (!currentPin || !(await user.comparePin(currentPin))) {
      return res.status(401).json({ message: 'Current PIN is incorrect' });
    }

    user.transactionPin = newPin;
    await user.save();
    res.json({ message: 'Transaction PIN changed successfully' });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
};
