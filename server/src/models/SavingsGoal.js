import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    icon: { type: String },
    color: { type: String },
    target: { type: Number, required: true },
    saved: { type: Number, default: 0 },
    deadline: { type: Date },
    isCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('SavingsGoal', savingsGoalSchema);
