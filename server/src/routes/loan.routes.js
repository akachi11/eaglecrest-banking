import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/error.js';
import protect from '../middleware/auth.js';
import { getLoans, applyForLoan, makePayment } from '../controllers/loan.controller.js';

const router = Router();

router.use(protect);
router.get('/', getLoans);
router.post(
  '/apply',
  [
    body('name').trim().notEmpty().withMessage('Loan name is required'),
    body('type').notEmpty().withMessage('Loan type is required'),
    body('principal').isFloat({ gt: 0 }).withMessage('Principal must be greater than zero'),
    body('rate').isFloat({ gt: 0 }).withMessage('Rate must be greater than zero'),
    body('termMonths').isInt({ gt: 0 }).withMessage('Term must be a positive integer'),
  ],
  validate,
  applyForLoan
);
router.post('/:id/pay', makePayment);

export default router;
