import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    number: { type: String, required: true, unique: true },
    type: { type: String, enum: ['checking', 'savings', 'private'], default: 'private' },
    balance: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'USD' },
    cardType: { type: String, enum: ['visa', 'mastercard'], default: 'visa' },
    cardExpiry: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Account', accountSchema);
