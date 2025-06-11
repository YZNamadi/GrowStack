import { Op } from 'sequelize';
import User from '../models/User';
import { processScheduledNotifications, sendInactivityNudge } from '../services/notification.service';
import { createEvent } from '../services/event.service';

// Process scheduled notifications every minute
export const processNotifications = async () => {
  try {
    await processScheduledNotifications();
  } catch (error) {
    console.error('Error processing scheduled notifications:', error);
  }
};

// Send inactivity nudges daily
export const sendInactivityNudges = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const inactiveUsers = await User.findAll({
      where: {
        lastActive: {
          [Op.lt]: sevenDaysAgo,
        },
        status: 'ACTIVE',
      },
    });

    for (const user of inactiveUsers) {
      try {
        await sendInactivityNudge(user.id);
        
        // Track nudge sent event
        await createEvent({
          userId: user.id,
          eventName: 'inactivity_nudge_sent',
          properties: {
            daysInactive: Math.floor(
              (Date.now() - user.lastActive.getTime()) / (1000 * 60 * 60 * 24)
            ),
          },
        });
      } catch (error) {
        console.error(`Error sending inactivity nudge to user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending inactivity nudges:', error);
  }
};

// Send KYC reminders daily
export const sendKycReminders = async () => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const usersNeedingKyc = await User.findAll({
      where: {
        onboardingStep: {
          [Op.ne]: 'KYC_COMPLETE',
        },
        createdAt: {
          [Op.lt]: threeDaysAgo,
        },
        status: 'ACTIVE',
      },
    });

    for (const user of usersNeedingKyc) {
      try {
        await sendKycReminder(user.id);
        
        // Track KYC reminder sent event
        await createEvent({
          userId: user.id,
          eventName: 'kyc_reminder_sent',
          properties: {
            daysSinceSignup: Math.floor(
              (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
            ),
            currentStep: user.onboardingStep,
          },
        });
      } catch (error) {
        console.error(`Error sending KYC reminder to user ${user.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error sending KYC reminders:', error);
  }
}; 