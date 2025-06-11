import { Op } from 'sequelize';
import User, { UserStatus } from '../models/User';
import Event from '../models/Event';
import Referral from '../models/Referral';
import Notification from '../models/Notification';
import { OnboardingStep } from '../models/User';
import { ReferralStatus } from '../models/Referral';
import { NotificationType, NotificationStatus } from '../models/Notification';

interface TimeRange {
  startDate: Date;
  endDate: Date;
}

export const getOnboardingAnalytics = async (timeRange?: TimeRange) => {
  const where = timeRange
    ? {
        createdAt: {
          [Op.between]: [timeRange.startDate, timeRange.endDate],
        },
      }
    : {};

  const users = await User.findAll({
    where,
    attributes: ['onboardingStep', 'createdAt'],
  });

  const stepCounts = users.reduce((acc, user) => {
    acc[user.onboardingStep] = (acc[user.onboardingStep] || 0) + 1;
    return acc;
  }, {} as Record<OnboardingStep, number>);

  const dropOffs = Object.entries(stepCounts).reduce((acc, [step, count], index, array) => {
    if (index < array.length - 1) {
      const nextStep = array[index + 1][0];
      const nextCount = array[index + 1][1];
      acc[`${step}_to_${nextStep}`] = count - nextCount;
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    totalUsers: users.length,
    stepCounts,
    dropOffs,
  };
};

export const getReferralAnalytics = async (timeRange?: TimeRange) => {
  const where = timeRange
    ? {
        createdAt: {
          [Op.between]: [timeRange.startDate, timeRange.endDate],
        },
      }
    : {};

  const referrals = await Referral.findAll({
    where,
    attributes: ['status', 'rewardAmount'],
  });

  const statusCounts = referrals.reduce((acc, referral) => {
    acc[referral.status] = (acc[referral.status] || 0) + 1;
    return acc;
  }, {} as Record<ReferralStatus, number>);

  const totalRewards = referrals.reduce((sum, referral) => {
    return sum + (referral.rewardAmount || 0);
  }, 0);

  return {
    totalReferrals: referrals.length,
    statusCounts,
    totalRewards,
  };
};

export const getEventAnalytics = async (timeRange?: TimeRange) => {
  const where = timeRange
    ? {
        createdAt: {
          [Op.between]: [timeRange.startDate, timeRange.endDate],
        },
      }
    : {};

  const events = await Event.findAll({
    where,
    attributes: ['eventName', 'createdAt'],
  });

  const eventCounts = events.reduce((acc, event) => {
    acc[event.eventName] = (acc[event.eventName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate event frequency over time
  const timeSeries = events.reduce((acc, event) => {
    const date = event.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalEvents: events.length,
    eventCounts,
    timeSeries,
  };
};

export const getNotificationAnalytics = async (timeRange?: TimeRange) => {
  const where = timeRange
    ? {
        createdAt: {
          [Op.between]: [timeRange.startDate, timeRange.endDate],
        },
      }
    : {};

  const notifications = await Notification.findAll({
    where,
    attributes: ['type', 'channel', 'status', 'read'],
  });

  const typeCounts = notifications.reduce((acc, notification) => {
    acc[notification.type] = (acc[notification.type] || 0) + 1;
    return acc;
  }, {} as Record<NotificationType, number>);

  const channelCounts = notifications.reduce((acc, notification) => {
    acc[notification.channel] = (acc[notification.channel] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusCounts = notifications.reduce((acc, notification) => {
    acc[notification.status] = (acc[notification.status] || 0) + 1;
    return acc;
  }, {} as Record<NotificationStatus, number>);

  const readRate = notifications.length > 0
    ? notifications.filter(n => n.read).length / notifications.length
    : 0;

  return {
    totalNotifications: notifications.length,
    typeCounts,
    channelCounts,
    statusCounts,
    readRate,
  };
};

export const getUserRetentionAnalytics = async (timeRange?: TimeRange) => {
  const where = timeRange
    ? {
        createdAt: {
          [Op.between]: [timeRange.startDate, timeRange.endDate],
        },
      }
    : {};

  const users = await User.findAll({
    where,
    attributes: ['id', 'createdAt', 'lastActive', 'status'],
  });

  const now = new Date();
  const retentionRates = {
    '7d': 0,
    '30d': 0,
    '90d': 0,
  };

  const activeUsers = users.filter(user => user.status === UserStatus.ACTIVE);
  const totalUsers = users.length;

  if (totalUsers > 0) {
    retentionRates['7d'] = activeUsers.filter(user => {
      const daysSinceLastActive = Math.floor(
        (now.getTime() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastActive <= 7;
    }).length / totalUsers;

    retentionRates['30d'] = activeUsers.filter(user => {
      const daysSinceLastActive = Math.floor(
        (now.getTime() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastActive <= 30;
    }).length / totalUsers;

    retentionRates['90d'] = activeUsers.filter(user => {
      const daysSinceLastActive = Math.floor(
        (now.getTime() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysSinceLastActive <= 90;
    }).length / totalUsers;
  }

  return {
    totalUsers,
    activeUsers: activeUsers.length,
    retentionRates,
  };
}; 