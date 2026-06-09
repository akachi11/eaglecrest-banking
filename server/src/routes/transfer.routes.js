import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/error.js';
import protect from '../middleware/auth.js';
import {
  sendTransfer,
  getRecipients,
  addRecipient,
  deleteRecipient,
} from '../controllers/transfer.controller.js';

const router = Router();

router.use(protect);

router.post(
  '/send',
  [
    body('recipientId').notEmpty().withMessage('Recipient is required'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero'),
  ],
  validate,
  sendTransfer
);

router.get('/recipients', getRecipients);
router.post(
  '/recipients',
  [body('name').trim().notEmpty().withMessage('Recipient name is required')],
  validate,
  addRecipient
);
router.delete('/recipients/:id', deleteRecipient);

export default router;
