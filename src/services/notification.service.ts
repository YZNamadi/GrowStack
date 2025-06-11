import nodemailer from 'nodemailer';
import { createClient } from 'redis';
import { config } from 'dotenv';
import User from '../models/User';
import Notification, {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from '../models/Notification';
import { createEvent } from './event.service';
import { AppError } from '../middleware/errorHandler';

config();

// Initialize Redis client
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.connect();

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  content: string;
  metadata?: {
    templateId?: string;
    variables?: Record<string, any>;
  };
  scheduledFor?: Date;
}

export const createNotification = async ({
  userId,
  type,
  channel,
  title,
  content,
  metadata = {},
  scheduledFor,
}: CreateNotificationParams) => {
  const notification = await Notification.create({
    userId,
    type,
    channel,
    title,
    content,
    metadata,
    scheduledFor,
    status: NotificationStatus.PENDING,
  });

  // If scheduled for later, store in Redis
  if (scheduledFor) {
    await redisClient.zAdd('scheduled_notifications', {
      score: scheduledFor.getTime(),
      value: notification.id.toString(),
    });
  } else {
    // Send immediately
    await sendNotification(notification);
  }

  return notification;
};

export const sendNotification = async (notification: Notification) => {
  try {
    switch (notification.channel) {
      case NotificationChannel.EMAIL:
        await sendEmail(notification);
        break;
      case NotificationChannel.SMS:
        await sendSMS(notification);
        break;
      case NotificationChannel.WHATSAPP:
        await sendWhatsApp(notification);
        break;
      default:
        throw new AppError('Unsupported notification channel', 400);
    }

    // Update notification status
    await notification.update({
      status: NotificationStatus.SENT,
      metadata: {
        ...notification.metadata,
        sentAt: new Date(),
      },
    });

    // Track notification sent event
    await createEvent({
      userId: notification.userId,
      eventName: 'notification_sent',
      properties: {
        notificationId: notification.id,
        type: notification.type,
        channel: notification.channel,
      },
    });
  } catch (error) {
    // Update notification status to failed
    await notification.update({
      status: NotificationStatus.FAILED,
      metadata: {
        ...notification.metadata,
        error: error instanceof Error ? error.message : 'Unknown error',
        retryCount: (notification.metadata?.retryCount || 0) + 1,
      },
    });

    throw error;
  }
};

const sendEmail = async (notification: Notification) => {
  const user = await User.findByPk(notification.userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  await emailTransporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: notification.title,
    text: notification.content,
    html: notification.content, // Assuming content is HTML
  });
};

const sendSMS = async (notification: Notification) => {
  // Implement SMS sending logic using Termii or Twilio
  // This is a placeholder
  console.log('Sending SMS to user:', notification.userId);
};

const sendWhatsApp = async (notification: Notification) => {
  // Implement WhatsApp sending logic using Meta's API
  // This is a placeholder
  console.log('Sending WhatsApp message to user:', notification.userId);
};

export const processScheduledNotifications = async () => {
  const now = Date.now();
  const scheduledNotifications = await redisClient.zRangeByScore(
    'scheduled_notifications',
    0,
    now
  );

  for (const notificationId of scheduledNotifications) {
    const notification = await Notification.findByPk(parseInt(notificationId));
    if (notification && notification.status === NotificationStatus.PENDING) {
      await sendNotification(notification);
    }
  }

  // Remove processed notifications from the sorted set
  if (scheduledNotifications.length > 0) {
    await redisClient.zRem('scheduled_notifications', ...scheduledNotifications);
  }
};

export const sendInactivityNudge = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const lastActive = user.lastActive;
  const daysSinceLastActive = Math.floor(
    (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastActive >= 7) {
    await createNotification({
      userId,
      type: NotificationType.INACTIVITY,
      channel: NotificationChannel.EMAIL,
      title: 'We Miss You!',
      content: `Hi ${user.firstName},<br><br>We noticed you haven't been active for a while. Come back and complete your profile to unlock all features!`,
    });
  }
};

export const sendKycReminder = async (userId: number) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.onboardingStep !== 'KYC_COMPLETE') {
    await createNotification({
      userId,
      type: NotificationType.KYC_REMINDER,
      channel: NotificationChannel.EMAIL,
      title: 'Complete Your KYC',
      content: `Hi ${user.firstName},<br><br>Don't forget to complete your KYC verification to access all features of our platform.`,
    });
  }
}; 