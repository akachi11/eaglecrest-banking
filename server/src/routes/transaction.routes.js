import { Router } from 'express';
import protect from '../middleware/auth.js';
import {
  getTransactions,
  getTransaction,
  getCashFlow,
  getSpendingByCategory,
} from '../controllers/transaction.controller.js';

const router = Router();

router.use(protect);
router.get('/', getTransactions);
router.get('/cash-flow', getCashFlow);
router.get('/spending', getSpendingByCategory);
router.get('/:id', getTransaction);

export default router;
