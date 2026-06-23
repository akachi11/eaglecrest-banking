import 'dotenv/config';
import mongoose from 'mongoose';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

const ACCOUNT_ID = '6a300024683db2a1dbb27da2';

const generateRef = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const account = await Account.findById(ACCOUNT_ID);
  if (!account) throw new Error(`Account ${ACCOUNT_ID} not found`);

  const USER_ID = account.user;

  const transactions = [
    {
      account: account._id,
      user: USER_ID,
      name: 'Incoming Wire Transfer',
      category: 'Transfer',
      amount: 178500,
      type: 'credit',
      status: 'completed',
      date: new Date('2026-05-08T10:30:00Z'),
      note: 'Incoming wire from corporate account',
      reference: generateRef(),
      icon: 'ti-arrow-down-left',
      iconBg: 'rgba(91,155,213,0.12)',
      iconColor: '#5B9BD5',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Vendor Payment',
      category: 'Payment',
      amount: 143200,
      type: 'debit',
      status: 'completed',
      date: new Date('2026-05-14T09:15:00Z'),
      note: 'Payment to vendor for services rendered',
      reference: generateRef(),
      icon: 'ti-arrow-up-right',
      iconBg: 'rgba(201,168,76,0.12)',
      iconColor: '#C9A84C',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Business Settlement',
      category: 'Transfer',
      amount: 196750,
      type: 'credit',
      status: 'completed',
      date: new Date('2026-05-22T14:45:00Z'),
      note: 'Settlement received from business partner',
      reference: generateRef(),
      icon: 'ti-arrow-down-left',
      iconBg: 'rgba(91,155,213,0.12)',
      iconColor: '#5B9BD5',
    },
    {
      account: account._id,
      user: USER_ID,
      name: 'Equipment Acquisition',
      category: 'Purchase',
      amount: 118340,
      type: 'debit',
      status: 'completed',
      date: new Date('2026-06-03T11:00:00Z'),
      note: 'Payment for equipment acquisition',
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

  account.balance = 150473.62;
  await account.save();
  console.log('Account balance set to:', account.balance);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
