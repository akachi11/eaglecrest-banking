import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    lastFour: { type: String, required: true },
    cardType: { type: String, enum: ['visa', 'mastercard'], default: 'visa' },
    cardName: { type: String, default: 'Virtual Card' },
    expiry: { type: String, required: true },
    isVirtual: { type: Boolean, default: false },
    isFrozen: { type: Boolean, default: false },
    spendingLimit: { type: Number },
    color: { type: String, default: '#C9A84C' },
    // application lifecycle
    status: {
      type: String,
      enum: ['pending', 'active', 'frozen', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Card', cardSchema);
