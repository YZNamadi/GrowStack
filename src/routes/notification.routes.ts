import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { NotificationType, NotificationChannel } from '../models/Notification';
import {
  sendUserNotification,
  getNotifications,
  markNotificationAsRead,
  sendInactivityNudgeToUser,
  sendKycReminderToUser,
} from '../controllers/notification.controller';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [SYSTEM, TRANSACTION, SECURITY, MARKETING]
 *         channel:
 *           type: string
 *           enum: [EMAIL, SMS, PUSH, IN_APP]
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         isRead:
 *           type: boolean
 *         scheduledFor:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications/send:
 *   post:
 *     summary: Send notification to user (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - channel
 *               - title
 *               - content
 *             properties:
 *               userId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [SYSTEM, TRANSACTION, SECURITY, MARKETING]
 *               channel:
 *                 type: string
 *                 enum: [EMAIL, SMS, PUSH, IN_APP]
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               scheduledFor:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Notification sent successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

// Send notification to user (admin only)
router.post(
  '/send',
  authorize([UserRole.ADMIN]),
  [
    body('userId').isInt().withMessage('User ID must be an integer'),
    body('type')
      .isIn(Object.values(NotificationType))
      .withMessage('Invalid notification type'),
    body('channel')
      .isIn(Object.values(NotificationChannel))
      .withMessage('Invalid notification channel'),
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('scheduledFor')
      .optional()
      .isISO8601()
      .withMessage('Scheduled date must be in ISO8601 format'),
  ],
  validateRequest,
  sendUserNotification
);

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user's notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 */

// Get user's notifications
router.get('/', getNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 */

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/inactivity-nudge/{userId}:
 *   post:
 *     summary: Send inactivity nudge to user (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: Inactivity nudge sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */

// Send inactivity nudge (admin only)
router.post(
  '/inactivity-nudge/:userId',
  authorize([UserRole.ADMIN]),
  sendInactivityNudgeToUser
);

/**
 * @swagger
 * /api/notifications/kyc-reminder/{userId}:
 *   post:
 *     summary: Send KYC reminder to user (admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: KYC reminder sent successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */

// Send KYC reminder (admin only)
router.post(
  '/kyc-reminder/:userId',
  authorize([UserRole.ADMIN]),
  sendKycReminderToUser
);

export default router; 