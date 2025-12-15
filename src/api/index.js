const express = require('express');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const estimateRoutes = require('./routes/estimate.routes');
const telegramRoutes = require('./routes/telegram.routes');

const apiRouter = express.Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/estimates', estimateRoutes);
apiRouter.use('/telegram', telegramRoutes);

module.exports = apiRouter;
