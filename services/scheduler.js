const cron = require('node-cron');
const { runNoticationSettings } = require('./stockService');

// import {
// 	runNoticationSettings
// } from './stockService'; // Your stock checking and notification logic



// Define the task to be run every 1 hour
// cron.schedule('*/1 * * * *', async () => { // every 1 minute
cron.schedule('0 * * * *', async () => { // every 1 hour
	console.log('Running task every 1 hour');
	try {
		await runNoticationSettings();
	} catch (error) {
		console.error('Error in scheduled task:', error);
	}
});