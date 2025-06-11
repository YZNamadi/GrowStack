import { Router } from 'express';
import { body, query } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authorize } from '../middleware/auth';
import {
  sendUserNotification,
  getNotifications,
  markNotificationAsRead,
  sendInactivityNudgeToUser,
  sendKycReminderToUser,
} from '../controllers/notification.controller';
import { NotificationChannel, NotificationType } from '../models/Notification';
import { UserRole } from '../models/User';

const router = Router();

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

// Get user's notifications
router.get(
  '/',
  authorize(),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(Object.values(NotificationType))
      .withMessage('Invalid notification type'),
    query('channel')
      .optional()
      .isIn(Object.values(NotificationChannel))
      .withMessage('Invalid notification channel'),
    query('status')
      .optional()
      .isIn(['PENDING', 'SENT', 'FAILED', 'READ'])
      .withMessage('Invalid notification status'),
  ],
  validateRequest,
  getNotifications
);

// Mark notification as read
router.patch(
  '/:notificationId/read',
  authorize(),
  markNotificationAsRead
);

// Send inactivity nudge to user (admin only)
router.post(
  '/inactivity-nudge/:userId',
  authorize([UserRole.ADMIN]),
  sendInactivityNudgeToUser
);

// Send KYC reminder to user (admin only)
router.post(
  '/kyc-reminder/:userId',
  authorize([UserRole.ADMIN]),
  sendKycReminderToUser
);

export default router; 