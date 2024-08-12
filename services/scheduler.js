import cron from 'node-cron';
import { checkStockPricesAndNotify } from './stockService'; // Your stock checking and notification logic

// Schedule the job to run every hour
cron.schedule('0 * * * *', async () => {
  try {
    await checkStockPricesAndNotify();
  } catch (error) {
    console.error('Error in scheduled task:', error);
  }
});
