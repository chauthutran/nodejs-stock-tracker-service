
const express = require('express');
const app = express();

require('dotenv').config({ path: '.env.local' });
require('./services/scheduler'); // Import the scheduler to start the cron job

console.log('Scheduler started. Waiting for tasks to run every 1 hour...');

app.get('/', (req, res) => {
    res.send('Service is start!');
});