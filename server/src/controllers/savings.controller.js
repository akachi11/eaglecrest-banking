import SavingsGoal from '../models/SavingsGoal.js';

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

    goal.saved = Math.min(goal.target, goal.saved + amount);
    if (goal.saved >= goal.target) goal.isCompleted = true;
    await goal.save();
    res.json({ goal });
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
