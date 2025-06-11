import { Router } from 'express';
import { body, query } from 'express-validator';
import { updateStep, getStats, getTimeStats } from '../controllers/onboarding.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Update onboarding step
router.post(
  '/step',
  [
    body('step').notEmpty().withMessage('Step is required'),
    body('metadata').optional().isObject(),
  ],
  validateRequest,
  updateStep
);

// Get onboarding statistics (admin only)
router.get(
  '/stats',
  authorize(UserRole.ADMIN),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  getStats
);

// Get onboarding time statistics (admin only)
router.get(
  '/time-stats',
  authorize(UserRole.ADMIN),
  validateRequest,
  getTimeStats
);

export default router; 