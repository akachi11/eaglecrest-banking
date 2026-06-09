import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    status: {
      type: String,
      enum: ['completed', 'pending', 'failed', 'processing'],
      default: 'pending',
    },
    date: { type: Date, default: Date.now },
    icon: { type: String },
    iconBg: { type: String },
    iconColor: { type: String },
    note: { type: String },
    reference: { type: String, unique: true },
  },
  { timestamps: true }
);

transactionSchema.index({ account: 1, date: -1 });
transactionSchema.index({ user: 1, date: -1 });

export default mongoose.model('Transaction', transactionSchema);
