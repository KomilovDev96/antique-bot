exports.proxyTelegramFile = (req, res) => {
  // req.params[0] may be undefined with regex; use raw path minus leading slash
  const filePath = (req.params?.[0] || req.url || "").replace(/^\/+/, "");
  if (!filePath) {
    return res.status(400).send("Missing file path");
  }
  const target = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${filePath}`;
  res.redirect(target);
};
