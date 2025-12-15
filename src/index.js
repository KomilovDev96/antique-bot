// src/index.js
require('dotenv').config();

const connectDB = require('./db');
const bot = require('./bot');

const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const adminPostsRoutes = require('./routes/adminPosts');
const estimatesRoutes = require("./routes/estimates");
const adminOrder = require("./routes/adminOrder");


async function start() {
  try {
    // 1. Подключаемся к MongoDB
    await connectDB();

    // 2. Запускаем Telegram-бота
    bot.launch();
    console.log('🤖 Bot started successfully!');
    console.log('📡 Waiting for commands...');

    // 3. Поднимаем HTTP-сервер для админки
    const app = express();

    app.use(cors());
    app.use(express.json());

    // базовый тест-роут
    app.get('/', (req, res) => {
      res.send('Antikvar admin API is running');
    });

    // роуты авторизации
    app.use('/api/auth', authRoutes);
    app.use('/api/admin/posts', adminPostsRoutes);
    app.use("/api/admin/estimates", estimatesRoutes);
    app.use("/api/admin", adminOrder);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🌐 Admin API running on port ${PORT}`);
    });

    // 4. Graceful shutdown для бота
    process.once('SIGINT', () => {
      console.log('⚠️ SIGINT received, stopping bot...');
      bot.stop('SIGINT');
      process.exit(0);
    });

    process.once('SIGTERM', () => {
      console.log('⚠️ SIGTERM received, stopping bot...');
      bot.stop('SIGTERM');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error starting app:', error.message);
  }
}

start();
