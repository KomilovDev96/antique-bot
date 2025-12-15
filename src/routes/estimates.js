const express = require("express");
const Estimate = require("../models/Estimate");
const auth = require("../middleware/authMiddleware");
const bot = require("../bot"); // ✅ добавили, чтобы отправлять из бота

const router = express.Router();

// 🔹 Получить все оценки
router.get("/", auth, async (req, res) => {
  try {
    const list = await Estimate.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Ответить на оценку
router.patch("/:id/reply", auth, async (req, res) => {
  try {
    const { reply } = req.body;
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: "So‘rov topilmadi" });

    // сохраняем ответ
    estimate.adminReply = reply;
    estimate.status = "replied";
    await estimate.save();

    // ✅ отправляем ответ пользователю в Telegram
    if (estimate.userId) {
      await bot.telegram.sendMessage(
        estimate.userId,
        `💰 <b>Admin javobi:</b>\n${reply}`,
        { parse_mode: "HTML" }
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Estimate reply error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
