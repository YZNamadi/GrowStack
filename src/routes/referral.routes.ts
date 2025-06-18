import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferralCode:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ReferralStats:
 *       type: object
 *       properties:
 *         totalReferrals:
 *           type: integer
 *         activeReferrals:
 *           type: integer
 *         totalRewards:
 *           type: number
 *         pendingRewards:
 *           type: number
 *     ReferralTree:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *         referrals:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReferralTree'
 */

/**
 * @swagger
 * /api/referrals/code:
 *   get:
 *     summary: Get user's referral code
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral code retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralCode'
 *       401:
 *         description: Unauthorized
 */

// Get user's referral code
router.get('/code', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    data: {
      message: 'Get referral code endpoint'
    }
  });
});

/**
 * @swagger
 * /api/referrals/stats:
 *   get:
 *     summary: Get referral statistics
 *     tags: [Referrals]
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
 *         description: Referral statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralStats'
 *       401:
 *         description: Unauthorized
 */

// Get referral statistics
router.get(
  '/stats',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: {
        message: 'Referral stats endpoint'
      }
    });
  }
);

/**
 * @swagger
 * /api/referrals/tree:
 *   get:
 *     summary: Get referral tree (admin only)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: User ID to get referral tree for
 *       - in: query
 *         name: depth
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Depth of the referral tree
 *     responses:
 *       200:
 *         description: Referral tree retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReferralTree'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

// Get referral tree (admin only)
router.get(
  '/tree',
  authorize([UserRole.ADMIN]),
  [
    query('userId').optional().isInt(),
    query('depth').optional().isInt({ min: 1, max: 10 })
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: {
        message: 'Referral tree endpoint'
      }
    });
  }
);

/**
 * @swagger
 * /api/referrals/claim-reward:
 *   post:
 *     summary: Claim referral reward
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralId
 *             properties:
 *               referralId:
 *                 type: integer
 *                 description: ID of the referral to claim reward for
 *     responses:
 *       200:
 *         description: Reward claimed successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Referral not found
 */

// Claim referral reward
router.post(
  '/claim-reward',
  [
    body('referralId').isInt()
  ],
  validateRequest,
  (req: Request, res: Response) => {
    res.json({
      status: 'success',
      data: {
        message: 'Claim reward endpoint'
      }
    });
  }
);

/**
 * @swagger
 * /api/referrals:
 *   get:
 *     summary: Get all referrals (admin and user)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of referrals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   referrerId:
 *                     type: integer
 *                   referredId:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 */

router.get('/', authorize([UserRole.ADMIN, UserRole.USER]), async (req, res) => {
  res.json({ message: 'Get referrals' });
});

/**
 * @swagger
 * /api/referrals:
 *   post:
 *     summary: Create new referral (user only)
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referredEmail
 *             properties:
 *               referredEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the person being referred
 *     responses:
 *       201:
 *         description: Referral created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - User access required
 */

router.post('/', authorize([UserRole.USER]), async (req, res) => {
  res.json({ message: 'Create referral' });
});

export default router; 