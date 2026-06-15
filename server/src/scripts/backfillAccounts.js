import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Account from '../models/Account.js';

const generateAccountNumber = () =>
  Math.floor(1000000000 + Math.random() * 9000000000).toString();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const users = await User.find();
  let created = 0;

  for (const user of users) {
    const existing = await Account.findOne({ user: user._id });
    if (existing) continue;

    let number = generateAccountNumber();
    while (await Account.findOne({ number })) {
      number = generateAccountNumber();
    }

    await Account.create({
      user: user._id,
      number,
      type: user.accountType || 'private',
      balance: 0,
      cardExpiry: `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear() + 4 - 2000}`,
    });

    created += 1;
    console.log(`Created account for ${user.email}`);
  }

  console.log(`Done. Created ${created} account(s) for ${users.length} user(s).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
