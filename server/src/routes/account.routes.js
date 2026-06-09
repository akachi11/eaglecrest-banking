import { Router } from 'express';
import protect from '../middleware/auth.js';
import { getMyAccount, getAllAccounts } from '../controllers/account.controller.js';

const router = Router();

router.use(protect);
router.get('/', getAllAccounts);
router.get('/primary', getMyAccount);

export default router;
