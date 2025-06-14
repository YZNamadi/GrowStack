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
router.get('/', getNotifications);

// Mark notification as read
router.put('/:id/read', markNotificationAsRead);

// Send inactivity nudge (admin only)
router.post(
  '/inactivity-nudge/:userId',
  authorize([UserRole.ADMIN]),
  sendInactivityNudgeToUser
);

// Send KYC reminder (admin only)
router.post(
  '/kyc-reminder/:userId',
  authorize([UserRole.ADMIN]),
  sendKycReminderToUser
);

export default router; 