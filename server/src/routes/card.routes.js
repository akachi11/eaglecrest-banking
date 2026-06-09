import { Router } from 'express';
import protect from '../middleware/auth.js';
import {
  getCards,
  applyForCard,
  issueVirtualCard,
  toggleFreeze,
  updateSpendingLimit,
} from '../controllers/card.controller.js';

const router = Router();

router.use(protect);
router.get('/', getCards);
router.post('/apply', applyForCard);
router.post('/virtual', issueVirtualCard);
router.patch('/:id/freeze', toggleFreeze);
router.patch('/:id/limit', updateSpendingLimit);

export default router;
