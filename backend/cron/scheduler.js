const cron = require('node-cron');
const monitoringJob = require('./monitoringJob');
const reportingJob = require('./reportingJob');

const startCronJobs = () => {
  // Fetch performance data every 6 hours
  cron.schedule('0 */6 * * *', async () => {
    console.log('[CRON] Running performance monitoring job...');
    try {
      await monitoringJob.run();
      console.log('[CRON] Monitoring job completed');
    } catch (error) {
      console.error('[CRON] Monitoring job failed:', error.message);
    }
  });

  // Generate daily reports at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily report generation...');
    try {
      await reportingJob.runDaily();
      console.log('[CRON] Daily report generation completed');
    } catch (error) {
      console.error('[CRON] Daily report generation failed:', error.message);
    }
  });

  // Generate weekly reports on Monday at 1 AM
  cron.schedule('0 1 * * 1', async () => {
    console.log('[CRON] Running weekly report generation...');
    try {
      await reportingJob.runWeekly();
      console.log('[CRON] Weekly report generation completed');
    } catch (error) {
      console.error('[CRON] Weekly report generation failed:', error.message);
    }
  });

  console.log('[CRON] All scheduled jobs initialized');
};

module.exports = { startCronJobs };
