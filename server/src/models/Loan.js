import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['Mortgage', 'Auto Loan', 'Personal', 'Education', 'Business'],
      required: true,
    },
    lender: { type: String },
    principal: { type: Number, required: true },
    balance: { type: Number, required: true },
    rate: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    nextDue: { type: Date },
    icon: { type: String },
    color: { type: String },
    status: {
      type: String,
      enum: ['pending', 'active', 'paid_off', 'delinquent'],
      default: 'pending',
    },
    termMonths: { type: Number },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Loan', loanSchema);
