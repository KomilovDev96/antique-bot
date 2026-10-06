require('dotenv').config({ path: process.env.ENV_FILE || 'env.local' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const bot = require('./src/bot');
const apiRouter = require('./src/api'); // New API router
const mobileRouter = require('./src/mobile/routes');
const { ADMIN_PANEL_ORIGIN } = require('./src/config/env');

connectDB();

const app = express();

// Allow front-end dev/prod origins
const allowedOrigins = [
  ADMIN_PANEL_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8081',
  'http://localhost:19006',
  'http://localhost:19000',
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json()); // Essential for parsing JSON bodies
app.use('/api', apiRouter); // Mount the new API router
app.use('/api/mobile/v1', mobileRouter);
app.use('/uploads', express.static(require('path').join(process.cwd(), 'uploads')));

// Root endpoint for testing API status
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Basic error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start bot
bot.launch().then(() => {
  console.log('Bot started');
}).catch(err => console.error('Bot launch error:', err));

// Enable graceful stop
const stopBot = signal => {
  if (bot.botInfo) bot.stop(signal);
};
process.once('SIGINT', () => stopBot('SIGINT'));
process.once('SIGTERM', () => stopBot('SIGTERM'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
