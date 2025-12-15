const Post = require("../../models/Post");
const Order = require("../../models/Order");
const publishPostToTelegram = require("../../utils/publishPost");
const postService = require("../../bot/services/post.service");
const bot = require("../../bot");
const adminService = require("../../bot/services/admin.service");

exports.getDashboard = async (req, res) => {
  res.send('Admin Dashboard');
};

exports.getAllPosts = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const sortOrder = req.query.sort === "asc" ? 1 : -1; // default: newest first
    const filter = {};
    if (status && ["pending", "approved", "rejected", "sold"].includes(status)) {
      filter.status = status;
    }

    const [items, total] = await Promise.all([
      Post.find(filter).sort({ createdAt: sortOrder }).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    res.json({ items, total, page, limit });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.approvePost = async (req, res) => {
  try {
    // This will be handled by the bot's admin.service.approvePost
    // For API, we just update status and let the bot publish
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Topilmadi" });

    // Assume bot handles publishing to Telegram
    post.status = "approved";
    await post.save();

    // Publish to channel
    await publishPostToTelegram(post);

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

exports.rejectPost = async (req, res) => {
  try {
    const post = await adminService.rejectPost(bot.telegram, req.params.id);
    res.json({ success: true, post });
  } catch (e) {
    console.error("rejectPost error:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Topilmadi" });

    await post.deleteOne();

    res.json({ success: true });
  } catch (e) {
    console.error("deletePost error:", e);
    res.status(500).json({ message: e.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }); // TODO: Use order service
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.markPostAsSold = async (req, res) => {
  try {
    const post = await postService.markPostAsSold(bot.telegram, req.params.id);
    res.json({ success: true, post });
  } catch (err) {
    console.error("markPostAsSold error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.approveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // TODO: move telegram logic to a service
    const caption = `
🛍️ <b>${order.itemName}</b>
📄 ${order.description || "-"}
☎️ ${order.contact || "-"}
${order.username ? "👤 @" + order.username : ""}
`;

    // This part should be moved to a service
    // if (order.photoPath) {
    //     await bot.telegram.sendPhoto(
    //         process.env.CHANNEL_ID,
    //         {
    //             url: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${order.photoPath}`,
    //         },
    //         { caption, parse_mode: "HTML" }
    //     );
    // } else {
    //     await bot.telegram.sendMessage(process.env.CHANNEL_ID, caption, {
    //         parse_mode: "HTML",
    //     });
    // }

    order.status = "approved";
    await order.save();
    res.json({ success: true });
  } catch (err) {
    console.error("approve order error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

exports.messageUser = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    // TODO: move telegram logic to a service
    // await bot.telegram.sendMessage(order.userId, `💬 <b>Admin:</b>\n${text}`, {
    //     parse_mode: "HTML",
    // });

    res.json({ success: true });
  } catch (err) {
    console.error("send message error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
