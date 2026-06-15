import 'dotenv/config';
import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const USER_ID = '6a300174dc4fcdfb48179aa6';

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

const randomBetween = (min, max) => Math.floor(min + Math.random() * (max - min));

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const account = await Account.findOne({ user: USER_ID });
  if (!account) throw new Error('Account not found for user');

  // Remove the previously-created mock transactions for a clean re-run
  await Transaction.deleteMany({ user: USER_ID });

  const transactions = [
    {
      account: account._id,
      user: USER_ID,
      name: 'Wire Transfer Sent',
      category: 'Transfer',
      amount: randomBetween(150000, 200000),
      type: 'debit',
      status: 'completed',
      date: new Date('2024-02-15T14:00:00Z'),
      note: 'Outgoing wire transfer',
      reference: generateRef(),
      icon: 'ti-arrow-up-right',
      iconBg: 'rgba(201,168,76,0.12)',
      iconColor: '#C9A84C',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Equipment Purchase',
      category: 'Transfer',
      amount: randomBetween(150000, 200000),
      type: 'debit',
      status: 'completed',
      date: new Date('2024-06-20T14:00:00Z'),
      note: 'Payment for equipment acquisition',
      reference: generateRef(),
      icon: 'ti-arrow-up-right',
      iconBg: 'rgba(201,168,76,0.12)',
      iconColor: '#C9A84C',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Business Settlement Sent',
      category: 'Transfer',
      amount: randomBetween(150000, 200000),
      type: 'debit',
      status: 'completed',
      date: new Date('2024-11-05T14:00:00Z'),
      note: 'Settlement to business partner',
      reference: generateRef(),
      icon: 'ti-arrow-up-right',
      iconBg: 'rgba(201,168,76,0.12)',
      iconColor: '#C9A84C',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Corporate Funds Transfer',
      category: 'Investment',
      amount: 30000000,
      type: 'credit',
      status: 'completed',
      date: daysFromNow(1),
      note: 'Investment return',
      reference: generateRef(),
      icon: 'ti-arrow-down-left',
      iconBg: 'rgba(91,155,213,0.12)',
      iconColor: '#5B9BD5',
    },
  ];

  const created = await Transaction.insertMany(transactions);
  created.forEach((t) =>
    console.log(`${t.date.toISOString()} | ${t.name} | ${t.type} $${t.amount.toLocaleString()} | ${t.status}`)
  );

  account.balance = 30000000;
  await account.save();
  console.log('New balance:', account.balance);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
