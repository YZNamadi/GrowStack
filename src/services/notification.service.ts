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
import { OnboardingStep } from '../models/User';
import { sendEmail } from '../config/email';

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
    read: false
  });

  // If scheduled for later, store in Redis
  if (scheduledFor) {
    await redisClient.zAdd('scheduled_notifications', {
      score: scheduledFor.getTime(),
      value: notification.id.toString(),
    });
  } else {
    // Send immediately
    await sendNotificationFromObject(notification);
  }

  return notification;
};

export const sendNotification = async (
  userId: number,
  type: NotificationType,
  channel: NotificationChannel,
  title: string,
  content: string,
  scheduledFor?: Date
) => {
  try {
    // Get user details
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Send email if channel is email
    if (channel === NotificationChannel.EMAIL) {
      await sendEmail(
        user.email,
        title,
        content,
        `<h1>${title}</h1><p>${content}</p>`
      );
    }

    // Create notification record
    const notification = await Notification.create({
      userId,
      type,
      channel,
      title,
      content,
      status: NotificationStatus.SENT,
      scheduledFor,
      read: false,
      metadata: {}
    });

    return notification;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Helper function to send notification from a notification object
export const sendNotificationFromObject = async (notification: Notification) => {
  return sendNotification(
    notification.userId,
    notification.type,
    notification.channel,
    notification.title,
    notification.content,
    notification.scheduledFor || undefined
  );
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
      await sendNotificationFromObject(notification);
    }
  }

  // Remove from scheduled notifications
  await redisClient.zRem('scheduled_notifications', scheduledNotifications as any);
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

  if (user.onboardingStep !== OnboardingStep.KYC_COMPLETE) {
    await createNotification({
      userId,
      type: NotificationType.KYC_REMINDER,
      channel: NotificationChannel.EMAIL,
      title: 'Complete Your KYC',
      content: `Hi ${user.firstName},<br><br>Don't forget to complete your KYC verification to access all features of our platform.`,
    });
  }
};

export const sendKycReminderToUser = async (userId: number) => {
  const notification = await Notification.create({
    userId,
    type: NotificationType.KYC_REMINDER,
    channel: NotificationChannel.EMAIL,
    title: 'Complete Your KYC',
    content: 'Please complete your KYC verification to continue using our services.',
    status: NotificationStatus.PENDING,
    read: false,
    metadata: {}
  });

  return sendNotificationFromObject(notification);
};

export const sendInactivityNudgeToUser = async (userId: number) => {
  const notification = await Notification.create({
    userId,
    type: NotificationType.INACTIVITY,
    channel: NotificationChannel.EMAIL,
    title: 'We Miss You!',
    content: 'Come back and check out our latest features.',
    status: NotificationStatus.PENDING,
    read: false,
    metadata: {}
  });

  return sendNotificationFromObject(notification);
}; 