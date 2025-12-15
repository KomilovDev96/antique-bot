// routes/telegramProxy.js
const express = require("express");
const router = express.Router();
router.get("/:path(*)", (req, res) => {
    const path = req.params.path;
    res.redirect(`https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${path}`);
});
module.exports = router;
