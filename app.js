require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const bot = require('./src/bot');
const apiRouter = require('./src/api'); // New API router
const { ADMIN_PANEL_ORIGIN } = require('./src/config/env');

connectDB();

const app = express();

// Allow front-end dev/prod origins
const allowedOrigins = [
  ADMIN_PANEL_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json()); // Essential for parsing JSON bodies
app.use('/api', apiRouter); // Mount the new API router

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
  // ВРЕМЕННЫЙ ТЕСТ: Попытка отправить простое текстовое сообщение
  try {
    bot.telegram.sendMessage(process.env.CHANNEL_ID, "Тестовое сообщение от бота из app.js!").then(() => {
      console.log("✅ Тестовое сообщение отправлено успешно.");
    }).catch((testError) => {
      console.error("❌ Ошибка при отправке тестового сообщения:", testError);
    });
  } catch (e) {
    console.error("❌ Критическая ошибка при инициализации отправки тестового сообщения:", e);
  }
}).catch(err => console.error('Bot launch error:', err));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

