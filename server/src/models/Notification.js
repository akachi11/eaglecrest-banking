import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    type: {
      type: String,
      enum: ['card', 'loan', 'transfer', 'security', 'system'],
      default: 'system',
    },
    read: { type: Boolean, default: false },
    icon: { type: String, default: 'ti-bell' },
    iconColor: { type: String, default: '#C9A84C' },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
