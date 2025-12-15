// src/sessions/memorySession.js
const LocalSession = require('telegraf-session-local');

const session = new LocalSession({
  database: 'session.json', // будет файл с состоянием
  property: 'session',
});

module.exports = session.middleware();
