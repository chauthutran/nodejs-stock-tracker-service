const cron = require('node-cron');
const { runNotificationSettings } = require('./stockService');

// import {
// 	runNoticationSettings
// } from './stockService'; // Your stock checking and notification logic



// Define the task to be run every 5 minutes
// cron.schedule('*/5 * * * *', async () => {
cron.schedule('*/1 * * * *', async () => {
	console.log('Running task every 5 minutes');
	try {
		await runNoticationSettings();
	} catch (error) {
		console.error('Error in scheduled task:', error);
	}
});



// const cron = require('node-cron');
// const axios = require('axios');

// // URL of the API you want to fetch data from
// const API_URL = 'https://jsonplaceholder.typicode.com/posts/1'; // Example API

// // Function to fetch data from the API
// const fetchData = async () => {
//   try {
//     const response = await axios.get(API_URL);
//     console.log('Data fetched:', response.data);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// };

// // Schedule the task to run every 5 minutes
// cron.schedule('*/5 * * * *', () => {
//   console.log('Running scheduled task...');
//   fetchData();
// });