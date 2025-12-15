const express = require('express');
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const estimateController = require("../controllers/estimate.controller");

const router = express.Router();

router.use(authMiddleware); // All admin routes require authentication

router.get('/dashboard', adminController.getDashboard);

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

module.exports = router;
