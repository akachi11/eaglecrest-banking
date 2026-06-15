import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    phone: { type: String, trim: true },
    avatar: { type: String },
    memberSince: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'closed'],
      default: 'pending',
    },
    preferences: {
      currency: { type: String, default: 'USD' },
      twoFactor: { type: Boolean, default: false },
      biometric: { type: Boolean, default: false },
      txnAlerts: { type: Boolean, default: true },
      securityAlerts: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    // Account application fields
    dob: { type: Date },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String, default: 'US' },
    },
    idType: { type: String, enum: ['passport', 'driver_license', 'state_id'] },
    ssnLast4: { type: String, maxlength: 4 },
    employment: {
      status: { type: String },
      employer: { type: String },
      annualIncome: { type: Number },
    },
    accountType: { type: String, enum: ['checking', 'savings', 'private'], default: 'private' },
    transactionPin: { type: String },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.isModified('transactionPin') && this.transactionPin) {
    this.transactionPin = await bcrypt.hash(this.transactionPin, 12);
  }
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.comparePin = function (candidate) {
  return bcrypt.compare(candidate, this.transactionPin);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.ssnLast4;
  obj.hasTransactionPin = !!obj.transactionPin;
  delete obj.transactionPin;
  return obj;
};

export default mongoose.model('User', userSchema);
