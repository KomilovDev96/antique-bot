const Post = require("../../models/Post");
const Order = require("../../models/Order");
const publishPostToTelegram = require("../../utils/publishPost");
const postService = require("../../bot/services/post.service");
const bot = require("../../bot");
const adminService = require("../../bot/services/admin.service");
const CollectorUser = require('../../models/CollectorUser');
const UserActivity = require('../../models/UserActivity');

exports.getDashboard = async (req, res) => {
  res.send('Admin Dashboard');
};

const userProjection = 'email name phone phoneVerified identityVerified telegramUsername emailVerified categoryIds createdAt updatedAt lastLoginAt lastLoginIp lastLoginUserAgent lastSeenAt lastSeenIp lastSeenUserAgent loginCount';

exports.getUsers = async (req, res) => {
  try {
    const inactiveDays = Math.min(Math.max(Number(req.query.inactiveDays) || 30, 1), 3650);
    const limit = Math.min(Math.max(Number(req.query.limit) || 500, 1), 5000);
    const filter = {};
    if (req.query.status === 'never') filter.lastLoginAt = null;
    if (req.query.status === 'inactive') filter.$or = [{ lastSeenAt: null }, { lastSeenAt: { $lt: new Date(Date.now() - inactiveDays * 86400000) } }];
    if (req.query.search) {
      const search = String(req.query.search).slice(0, 100);
      filter.$and = [{ $or: [{ email: new RegExp(search, 'i') }, { name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }] }];
    }
    const [items, total] = await Promise.all([
      CollectorUser.find(filter).select(userProjection).sort({ lastSeenAt: -1, createdAt: -1 }).limit(limit).lean(),
      CollectorUser.countDocuments(filter),
    ]);
    res.json({ items, total, inactiveDays });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAnalytics = async (req, res) => {
  try {
    const days = Math.min(Math.max(Number(req.query.days) || 30, 1), 365);
    const now = Date.now();
    const [totalUsers, active24h, active7d, active30d, neverLogged, inactive, totalEvents, featureUsage, topIps, dailyActive, recentActivity] = await Promise.all([
      CollectorUser.countDocuments(),
      CollectorUser.countDocuments({ lastSeenAt: { $gte: new Date(now - 86400000) } }),
      CollectorUser.countDocuments({ lastSeenAt: { $gte: new Date(now - 7 * 86400000) } }),
      CollectorUser.countDocuments({ lastSeenAt: { $gte: new Date(now - 30 * 86400000) } }),
      CollectorUser.countDocuments({ lastLoginAt: null }),
      CollectorUser.countDocuments({ $or: [{ lastSeenAt: null }, { lastSeenAt: { $lt: new Date(now - days * 86400000) } }] }),
      UserActivity.countDocuments({ createdAt: { $gte: new Date(now - days * 86400000) } }),
      UserActivity.aggregate([{ $match: { createdAt: { $gte: new Date(now - days * 86400000) } } }, { $group: { _id: '$feature', count: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } }, { $project: { _id: 0, feature: '$_id', count: 1, uniqueUsers: { $size: '$uniqueUsers' } } }, { $sort: { count: -1 } }, { $limit: 20 }]),
      UserActivity.aggregate([{ $match: { createdAt: { $gte: new Date(now - days * 86400000) }, ip: { $nin: [null, ''] } } }, { $group: { _id: '$ip', count: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' }, lastSeenAt: { $max: '$createdAt' } } }, { $project: { _id: 0, ip: '$_id', count: 1, uniqueUsers: { $size: '$uniqueUsers' }, lastSeenAt: 1 } }, { $sort: { count: -1 } }, { $limit: 20 }]),
      UserActivity.aggregate([{ $match: { createdAt: { $gte: new Date(now - days * 86400000) } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Tashkent' } }, uniqueUsers: { $addToSet: '$userId' }, events: { $sum: 1 } } }, { $project: { _id: 0, date: '$_id', uniqueUsers: { $size: '$uniqueUsers' }, events: 1 } }, { $sort: { date: 1 } }]),
      UserActivity.find({}).sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    const ids = recentActivity.map(item => String(item.userId));
    const users = await CollectorUser.find({ _id: { $in: ids } }).select('email name').lean();
    const userMap = new Map(users.map(user => [String(user._id), user]));
    res.json({
      periodDays: days,
      summary: { totalUsers, active24h, active7d, active30d, neverLogged, inactive },
      totalEvents,
      featureUsage,
      topIps,
      dailyActive,
      recentActivity: recentActivity.map(item => ({ ...item, user: userMap.get(String(item.userId)) || null })),
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
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
