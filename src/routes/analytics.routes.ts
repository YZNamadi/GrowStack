import { Router } from 'express';
import { query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  getOnboardingStats,
  getReferralStats,
  getEventStats,
  getNotificationStats,
  getRetentionStats,
} from '../controllers/analytics.controller';

const router = Router();

// All analytics routes require admin authorization
router.use(authorize([UserRole.ADMIN]));

// Get onboarding analytics
router.get(
  '/onboarding',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format'),
  ],
  validateRequest,
  getOnboardingStats
);

// Get referral analytics
router.get(
  '/referrals',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format'),
  ],
  validateRequest,
  getReferralStats
);

// Get event analytics
router.get(
  '/events',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format'),
  ],
  validateRequest,
  getEventStats
);

// Get notification analytics
router.get(
  '/notifications',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format'),
  ],
  validateRequest,
  getNotificationStats
);

// Get user retention analytics
router.get(
  '/retention',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be in ISO8601 format'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be in ISO8601 format'),
  ],
  validateRequest,
  getRetentionStats
);

export default router; 