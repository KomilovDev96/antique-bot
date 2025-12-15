const Estimate = require("../../models/Estimate");
const bot = require("../../bot");

exports.getAllEstimates = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Estimate.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Estimate.countDocuments(),
    ]);

    res.json({ items, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.replyToEstimate = async (req, res) => {
  try {
    const { reply } = req.body;
    const estimate = await Estimate.findById(req.params.id);
    if (!estimate) return res.status(404).json({ message: "So‘rov topilmadi" });

    estimate.adminReply = reply;
    estimate.status = "replied";
    await estimate.save();

    if (estimate.userId) {
      const usernameLine = estimate.username ? `@${estimate.username}` : "";
      const text = `<b>Admin javobi:</b>\n${reply}${usernameLine ? `\n\n${usernameLine}` : ""}`;
      try {
        await bot.telegram.sendMessage(estimate.userId, text, { parse_mode: "HTML" });
      } catch (notifyErr) {
        console.error("Failed to notify user about estimate reply:", notifyErr.message);
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Estimate reply error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
