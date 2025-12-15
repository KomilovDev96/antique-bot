const express = require('express');
const telegramController = require("../controllers/telegram.controller");

const router = express.Router();

// Proxy Telegram file paths like /file/botTOKEN/path/to/file
router.get(/.*/, telegramController.proxyTelegramFile);

module.exports = router;
