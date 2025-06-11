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
    const { userId, type, channel, title, content, metadata, scheduledFor } = req.body;

    // Validate notification type and channel
    if (!Object.values(NotificationType).includes(type)) {
      throw new AppError('Invalid notification type', 400);
    }
    if (!Object.values(NotificationChannel).includes(channel)) {
      throw new AppError('Invalid notification channel', 400);
    }

    const notification = await createNotification({
      userId,
      type,
      channel,
      title,
      content,
      metadata,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
    });

    res.status(201).json({
      status: 'success',
      data: {
        notification,
      },
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
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const { page = 1, limit = 10, type, channel, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = { userId };
    if (type) where.type = type;
    if (channel) where.channel = channel;
    if (status) where.status = status;

    const notifications = await Notification.findAndCountAll({
      where,
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications: notifications.rows,
        pagination: {
          total: notifications.count,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(notifications.count / Number(limit)),
        },
      },
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
    const { notificationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    await notification.update({
      status: NotificationStatus.READ,
      metadata: {
        ...notification.metadata,
        readAt: new Date()
      }
    });

    // Track notification read event
    await createEvent({
      userId,
      eventName: 'notification_read',
      properties: {
        notificationId: notification.id,
        type: notification.type,
        channel: notification.channel,
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        notification,
      },
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
    await sendInactivityNudge(Number(userId));

    res.status(200).json({
      status: 'success',
      message: 'Inactivity nudge sent successfully',
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
    await sendKycReminder(Number(userId));

    res.status(200).json({
      status: 'success',
      message: 'KYC reminder sent successfully',
    });
  } catch (error) {
    next(error);
  }
}; 