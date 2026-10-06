require('dotenv').config({ path: process.env.ENV_FILE || 'env.local' });

module.exports = {
  BOT_TOKEN: process.env.BOT_TOKEN,
  ADMIN_ID: process.env.ADMIN_ID,
  CHANNEL_ID: process.env.CHANNEL_ID,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/antique_bot',
  ADMIN_PANEL_ORIGIN: process.env.ADMIN_PANEL_ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET,
};


