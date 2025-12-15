const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'username va password kerak' });
  }

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({ message: 'Noto‘g‘ri login yoki parol' });
  }

  const payload = {
    username,
    role: 'admin',
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  return res.json({
    token,
    user: {
      username,
      role: 'admin',
    },
  });
};

exports.getMe = (req, res) => {
  return res.json({
    user: req.user,
  });
};
