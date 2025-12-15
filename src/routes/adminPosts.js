// src/routes/adminPosts.js
const express = require("express");
const Post = require("../models/Post");
const auth = require("../middleware/authMiddleware");
const publishPostToTelegram = require("../utils/publishPost"); // ⬅️ Добавили
const router = express.Router();

// GET /api/admin/posts
router.get("/", auth, async (req, res) => {
  try {

    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/admin/posts/:id/approve
router.patch("/:id/approve", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Topilmadi" });

    // ⚙️ Меняем статус
    post.status = "approved";
    await post.save();

    // 📢 Публикуем в Telegram
    await publishPostToTelegram(post);

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/admin/posts/:id/reject
router.patch("/:id/reject", auth, async (req, res) => {
  console.log("👉 APPROVE endpoint called:", req.params.id);
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Topilmadi" });

    post.status = "rejected";
    await post.save();

    // ❌ Уведомляем пользователя об отказе
    const { Telegraf } = require('telegraf');
    const bot = new Telegraf(process.env.BOT_TOKEN);
    await bot.telegram.sendMessage(
      post.userId,
      `❌ Sizning e’loningiz rad etildi.\n📜 ${post.title}`
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
