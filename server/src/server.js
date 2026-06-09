import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';

import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import transferRoutes from './routes/transfer.routes.js';
import cardRoutes from './routes/card.routes.js';
import savingsRoutes from './routes/savings.routes.js';
import loanRoutes from './routes/loan.routes.js';
import notificationRoutes from './routes/notification.routes.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => { console.error('DB connection failed:', err); process.exit(1); });
