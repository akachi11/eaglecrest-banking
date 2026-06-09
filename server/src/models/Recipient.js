import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    handle: { type: String },
    initials: { type: String },
    bank: { type: String },
    accountNumber: { type: String },
    routingNumber: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model('Recipient', recipientSchema);
