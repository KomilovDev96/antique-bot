const Estimate = require("../../models/Estimate");

exports.getAllEstimates = async (req, res) => {
  try {
    const list = await Estimate.find().sort({ createdAt: -1 });
    res.json(list);
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

    res.json({ success: true });
  } catch (err) {
    console.error("Estimate reply error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

