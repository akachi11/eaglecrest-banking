import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/error.js';
import protect from '../middleware/auth.js';
import { getGoals, createGoal, addFunds, deleteGoal } from '../controllers/savings.controller.js';

const router = Router();

router.use(protect);
router.get('/', getGoals);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Goal name is required'),
    body('target').isFloat({ gt: 0 }).withMessage('Target must be greater than zero'),
  ],
  validate,
  createGoal
);
router.patch('/:id/deposit', addFunds);
router.delete('/:id', deleteGoal);

export default router;
