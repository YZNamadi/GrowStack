import cron from 'node-cron';
import { processNotifications, sendInactivityNudges, sendKycReminders } from './tasks/notificationTasks';

// Initialize scheduler
export const initializeScheduler = () => {
  // Process scheduled notifications every minute
  cron.schedule('* * * * *', async () => {
    await processNotifications();
  });

  // Send inactivity nudges daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    await sendInactivityNudges();
  });

  // Send KYC reminders daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    await sendKycReminders();
  });

  console.log('Scheduler initialized successfully');
}; 