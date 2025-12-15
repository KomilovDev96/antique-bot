const Order = require("../models/Order");
const express = require("express");

const router = express.Router();
const bot = require("../bot");
// 🟢 Получить все заказы
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Одобрить заказ (опубликовать в канал)
router.patch("/orders/:id/approve", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        const caption = `
🛍️ <b>${order.itemName}</b>
📄 ${order.description || "-"}
☎️ ${order.contact || "-"}
${order.username ? "👤 @" + order.username : ""}
`;

        if (order.photoPath) {
            await bot.telegram.sendPhoto(
                process.env.CHANNEL_ID,
                {
                    url: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${order.photoPath}`,
                },
                { caption, parse_mode: "HTML" }
            );
        } else {
            await bot.telegram.sendMessage(process.env.CHANNEL_ID, caption, {
                parse_mode: "HTML",
            });
        }

        order.status = "approved";
        await order.save();
        res.json({ success: true });
    } catch (err) {
        console.error("approve order error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// 💬 Отправить сообщение пользователю
router.post("/orders/:id/message", async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        await bot.telegram.sendMessage(order.userId, `💬 <b>Admin:</b>\n${text}`, {
            parse_mode: "HTML",
        });

        res.json({ success: true });
    } catch (err) {
        console.error("send message error:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;