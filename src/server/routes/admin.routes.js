const express = require('express');
const { getAdminDashboard } = require('../controllers/admin.controller');
const router = express.Router();

router.get('/dashboard', getAdminDashboard);

module.exports = router;




