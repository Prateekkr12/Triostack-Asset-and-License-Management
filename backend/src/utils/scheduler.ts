import cron from 'node-cron';
import { sendExpiryNotifications } from '../services/notificationService';
import { updateExpiredAssets } from '../services/assetService';

/**
 * Initialize scheduled tasks
 */
export const initializeScheduler = (): void => {
  console.log('🕐 Initializing scheduler...');

  // Run expiry notifications every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('📧 Running daily expiry notifications...');
    try {
      await sendExpiryNotifications(30); // Check assets expiring in next 30 days
      console.log('✅ Daily expiry notifications completed');
    } catch (error) {
      console.error('❌ Error in daily expiry notifications:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Update expired assets status every day at 10:00 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Updating expired assets status...');
    try {
      const result = await updateExpiredAssets();
      console.log(`✅ Updated ${result.modifiedCount} expired assets`);
    } catch (error) {
      console.error('❌ Error updating expired assets:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Run weekly comprehensive check every Monday at 8:00 AM
  cron.schedule('0 8 * * 1', async () => {
    console.log('📧 Running weekly comprehensive expiry check...');
    try {
      await sendExpiryNotifications(90); // Check assets expiring in next 90 days
      console.log('✅ Weekly comprehensive expiry check completed');
    } catch (error) {
      console.error('❌ Error in weekly expiry check:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  // Run immediate expiry check (assets expiring today) every hour
  cron.schedule('0 * * * *', async () => {
    console.log('📧 Running hourly immediate expiry check...');
    try {
      await sendExpiryNotifications(1); // Check assets expiring in next 1 day
      console.log('✅ Hourly immediate expiry check completed');
    } catch (error) {
      console.error('❌ Error in hourly expiry check:', error);
    }
  }, {
    scheduled: true,
    timezone: 'UTC'
  });

  console.log('✅ Scheduler initialized successfully');
  console.log('📅 Scheduled tasks:');
  console.log('   - Daily expiry notifications: 9:00 AM UTC');
  console.log('   - Update expired assets: 10:00 AM UTC');
  console.log('   - Weekly comprehensive check: Monday 8:00 AM UTC');
  console.log('   - Hourly immediate check: Every hour');
};

/**
 * Stop all scheduled tasks
 */
export const stopScheduler = (): void => {
  console.log('🛑 Stopping scheduler...');
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  console.log('✅ Scheduler stopped');
};
