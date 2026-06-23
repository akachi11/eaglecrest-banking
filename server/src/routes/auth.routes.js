import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/error.js';
import protect from '../middleware/auth.js';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePreferences,
  changePassword,
  setTransactionPin,
  changeTransactionPin,
  approveApplication,
} from '../controllers/auth.controller.js';

const router = Router();

router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('transactionPin').matches(/^\d{4}$/).withMessage('Transaction PIN must be exactly 4 digits'),
  ],
  validate,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// Dev/admin: approve a pending application by userId
// In production this would be behind proper admin auth middleware
router.post('/approve/:id', approveApplication);

router.get('/me', protect, getMe);
router.patch('/me', protect, updateProfile);
router.patch('/me/preferences', protect, updatePreferences);
router.patch('/me/password', protect, changePassword);
router.patch(
  '/me/pin',
  protect,
  [body('pin').matches(/^\d{4}$/).withMessage('PIN must be exactly 4 digits')],
  validate,
  setTransactionPin
);

router.patch(
  '/me/pin/change',
  protect,
  [
    body('currentPin').matches(/^\d{4}$/).withMessage('Current PIN must be exactly 4 digits'),
    body('newPin').matches(/^\d{4}$/).withMessage('New PIN must be exactly 4 digits'),
  ],
  validate,
  changeTransactionPin
);

export default router;
