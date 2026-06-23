import 'dotenv/config';
import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const USER_ID = '6a31305966d4840cb25bb7de';

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const account = await Account.findOne({ user: USER_ID });
  if (!account) throw new Error(`Account not found for user ${USER_ID}`);

  const transactions = [
    {
      account: account._id,
      user: USER_ID,
      name: 'Corporate Wire Transfer',
      category: 'Transfer',
      amount: 164800,
      type: 'credit',
      status: 'completed',
      date: new Date('2026-05-06T09:00:00Z'),
      note: 'Incoming corporate wire transfer',
      reference: generateRef(),
      icon: 'ti-arrow-down-left',
      iconBg: 'rgba(91,155,213,0.12)',
      iconColor: '#5B9BD5',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Contract Payment',
      category: 'Payment',
      amount: 137500,
      type: 'debit',
      status: 'completed',
      date: new Date('2026-05-12T11:30:00Z'),
      note: 'Payment for contract services',
      reference: generateRef(),
      icon: 'ti-arrow-up-right',
      iconBg: 'rgba(201,168,76,0.12)',
      iconColor: '#C9A84C',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Investment Proceeds',
      category: 'Investment',
      amount: 189200,
      type: 'credit',
      status: 'completed',
      date: new Date('2026-05-27T14:00:00Z'),
      note: 'Proceeds from investment portfolio',
      reference: generateRef(),
      icon: 'ti-arrow-down-left',
      iconBg: 'rgba(91,155,213,0.12)',
      iconColor: '#5B9BD5',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Office Lease Payment',
      category: 'Payment',
      amount: 112650,
      type: 'debit',
      status: 'completed',
      date: new Date('2026-06-10T10:15:00Z'),
      note: 'Commercial office lease payment',
      reference: generateRef(),
      icon: 'ti-arrow-up-right',
      iconBg: 'rgba(201,168,76,0.12)',
      iconColor: '#C9A84C',
    },
  ];

  const created = await Transaction.insertMany(transactions);
  created.forEach((t) =>
    console.log(`${t.date.toISOString()} | ${t.name} | ${t.type} $${t.amount.toLocaleString()} | ${t.status}`)
  );

  account.balance = 150827.39;
  await account.save();
  console.log('Account balance set to:', account.balance);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
