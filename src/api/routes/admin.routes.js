const express = require('express');
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const estimateController = require("../controllers/estimate.controller");
const mobileAdminController = require("../controllers/mobileAdmin.controller");
const supportController = require('../controllers/support.controller');
const telegramStatusController = require('../controllers/telegramStatus.controller');

const router = express.Router();

router.use(authMiddleware); // All admin routes require authentication

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getUsers);
router.get('/analytics', adminController.getAnalytics);
router.get('/telegram-status', telegramStatusController.getStatus);

router.get('/posts', adminController.getAllPosts);
router.patch('/posts/:id/approve', adminController.approvePost);
router.patch('/posts/:id/reject', adminController.rejectPost);
router.patch('/posts/:id/sold', adminController.markPostAsSold);
router.delete('/posts/:id', adminController.deletePost);

router.get('/estimates', estimateController.getAllEstimates);
router.patch('/estimates/:id/reply', estimateController.replyToEstimate);

router.get('/orders', adminController.getAllOrders);
router.patch('/orders/:id/approve', adminController.approveOrder);
router.post('/orders/:id/message', adminController.messageUser);

router.get('/mobile-requests', mobileAdminController.getRequests);
router.patch('/mobile-requests/:id', mobileAdminController.updateRequest);
router.get('/mobile-listings', mobileAdminController.getListings);
router.patch('/mobile-listings/:id', mobileAdminController.updateListing);
router.get('/marketplace/sellers', mobileAdminController.getSellers);
router.patch('/marketplace/sellers/:id/verification', mobileAdminController.updateSellerVerification);

router.get('/support', supportController.adminList);
router.get('/support/unread-count', supportController.adminUnreadCount);
router.get('/support/:id/messages', supportController.adminMessages);
router.post('/support/:id/messages', supportController.adminReply);
router.patch('/support/:id', supportController.adminStatus);

module.exports = router;
