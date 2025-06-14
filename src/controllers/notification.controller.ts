import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import Notification, { NotificationChannel, NotificationType } from '../models/Notification';
import {
  createNotification,
  sendNotification,
  processScheduledNotifications,
  sendInactivityNudge,
  sendKycReminder,
} from '../services/notification.service';
import { createEvent } from '../services/event.service';
import { NotificationStatus } from '../models/Notification';

export const sendUserNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, type, channel, title, content, scheduledFor } = req.body;

    const notification = await sendNotification(
      userId,
      type as NotificationType,
      channel as NotificationChannel,
      title,
      content,
      scheduledFor ? new Date(scheduledFor) : undefined
    );

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user?.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: {
        id,
        userId: req.user?.id
      }
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await notification.update({
      read: true,
      status: NotificationStatus.READ
    });

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendInactivityNudgeToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const notification = await sendNotification(
      parseInt(userId),
      NotificationType.INACTIVITY,
      NotificationChannel.EMAIL,
      'We Miss You!',
      'Come back and check out our latest features.'
    );

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
};

export const sendKycReminderToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const notification = await sendNotification(
      parseInt(userId),
      NotificationType.KYC_REMINDER,
      NotificationChannel.EMAIL,
      'Complete Your KYC',
      'Please complete your KYC verification to continue using our services.'
    );

    res.status(200).json({
      status: 'success',
      data: {
        notification
      }
    });
  } catch (error) {
    next(error);
  }
}; 