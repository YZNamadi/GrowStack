import { Router } from 'express';
import { body, query } from 'express-validator';
import { updateStep, getStats, getTimeStats } from '../controllers/onboarding.controller';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     OnboardingStep:
 *       type: object
 *       required:
 *         - step
 *       properties:
 *         step:
 *           type: string
 *           description: Current onboarding step
 *         metadata:
 *           type: object
 *           description: Additional step-specific data
 *     OnboardingStats:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: integer
 *         completedUsers:
 *           type: integer
 *         completionRate:
 *           type: number
 *         stepDistribution:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *     OnboardingTimeStats:
 *       type: object
 *       properties:
 *         averageCompletionTime:
 *           type: number
 *         medianCompletionTime:
 *           type: number
 *         stepTimes:
 *           type: object
 *           additionalProperties:
 *             type: number
 */

/**
 * @swagger
 * /api/onboarding/step:
 *   post:
 *     summary: Update user's onboarding step
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingStep'
 *     responses:
 *       200:
 *         description: Onboarding step updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */

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

/**
 * @swagger
 * /api/onboarding/stats:
 *   get:
 *     summary: Get onboarding statistics (admin only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Onboarding statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

// Get onboarding statistics (admin only)
router.get(
  '/stats',
  authorize([UserRole.ADMIN]),
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
  ],
  validateRequest,
  getStats
);

/**
 * @swagger
 * /api/onboarding/time-stats:
 *   get:
 *     summary: Get onboarding time statistics (admin only)
 *     tags: [Onboarding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding time statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingTimeStats'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

// Get onboarding time statistics (admin only)
router.get(
  '/time-stats',
  authorize([UserRole.ADMIN]),
  validateRequest,
  getTimeStats
);

export default router; 