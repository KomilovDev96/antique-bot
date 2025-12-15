const express = require('express');
const estimateController = require("../controllers/estimate.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware); // All estimate routes require authentication

router.get('/', estimateController.getAllEstimates);
router.patch('/:id/reply', estimateController.replyToEstimate);

module.exports = router;
