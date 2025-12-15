// src/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'username va password kerak' });
  }

  // сверяем с .env
  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: 'Noto‘g‘ri login yoki parol' });
  }

  // создаём JWT
  const payload = {
    username,
    role: 'admin',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // 7 дней
  });

  return res.json({
    token,
    user: {
      username,
      role: 'admin',
    },
  });
});

// Пример защищённого маршрута, чтобы проверять токен
router.get('/me', authMiddleware, (req, res) => {
  return res.json({
    user: req.user,
  });
});

module.exports = router;
