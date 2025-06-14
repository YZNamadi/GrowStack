import { Router } from 'express';
import { body, param } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getProfile,
  updateProfile,
  getUserById,
  updateUserBlockStatus,
} from '../controllers/user.controller';

const router = Router();

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put(
  '/profile',
  [
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('phone').optional().isString(),
  ],
  validateRequest,
  updateProfile
);

// Get user by ID (admin only)
router.get(
  '/:id',
  authorize([UserRole.ADMIN]),
  [param('id').isInt()],
  validateRequest,
  getUserById
);

// Block/Unblock user (admin only)
router.patch(
  '/:id/block',
  authorize([UserRole.ADMIN]),
  [
    param('id').isInt(),
    body('isBlocked').isBoolean()
  ],
  validateRequest,
  updateUserBlockStatus
);

export default router; 