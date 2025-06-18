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

/**
 * @swagger
 * components:
 *   schemas:
 *     OnboardingStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         completedOnboarding:
 *           type: integer
 *         completionRate:
 *           type: number
 *         averageCompletionTime:
 *           type: number
 *         stepsCompletion:
 *           type: object
 *           properties:
 *             step1:
 *               type: integer
 *             step2:
 *               type: integer
 *             step3:
 *               type: integer
 *     ReferralStats:
 *       type: object
 *       properties:
 *         totalReferrals:
 *           type: integer
 *         activeReferrals:
 *           type: integer
 *         conversionRate:
 *           type: number
 *         averageRewardAmount:
 *           type: number
 *     EventStats:
 *       type: object
 *       properties:
 *         totalEvents:
 *           type: integer
 *         eventTypes:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *         averageEventsPerUser:
 *           type: number
 *     NotificationStats:
 *       type: object
 *       properties:
 *         totalSent:
 *           type: integer
 *         deliveryRate:
 *           type: number
 *         openRate:
 *           type: number
 *         clickRate:
 *           type: number
 *     RetentionStats:
 *       type: object
 *       properties:
 *         dailyActiveUsers:
 *           type: integer
 *         weeklyActiveUsers:
 *           type: integer
 *         monthlyActiveUsers:
 *           type: integer
 *         retentionRate:
 *           type: object
 *           properties:
 *             day1:
 *               type: number
 *             day7:
 *               type: number
 *             day30:
 *               type: number
 */

// All analytics routes require admin authorization
router.use(authorize([UserRole.ADMIN]));

/**
 * @swagger
 * /api/analytics/onboarding:
 *   get:
 *     summary: Get onboarding analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Onboarding analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

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

/**
 * @swagger
 * /api/analytics/referrals:
 *   get:
 *     summary: Get referral analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Referral analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

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

/**
 * @swagger
 * /api/analytics/events:
 *   get:
 *     summary: Get event analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Event analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

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

/**
 * @swagger
 * /api/analytics/notifications:
 *   get:
 *     summary: Get notification analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Notification analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

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

/**
 * @swagger
 * /api/analytics/retention:
 *   get:
 *     summary: Get user retention analytics (admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Retention analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RetentionStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

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