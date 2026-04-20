const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const historyActivityController = require('../controller/history_activity');

// READ ALL (admin only)
router.get('/', Middleware.verifyLogin, Middleware.verifyAdmin, (req, res, next) => {
    console.log("📍 Route GET /api/history_activity được gọi");
    console.log("👤 User session:", req.session?.user);
    next();
}, historyActivityController.read);

// READ BY USER (để lựa xem lại lịch sử hoạt động theo user_id)
router.get('/user/:id', Middleware.verifyLogin, Middleware.verifyAdmin, (req, res, next) => {
    console.log("📍 Route GET /api/history_activity/user/:id được gọi với id:", req.params.id);
    next();
}, historyActivityController.getByUser);

// READ PRODUCT HISTORY (để xem lịch sử thay đổi sản phẩm)
router.get('/product-history/all', Middleware.verifyLogin, Middleware.verifyAdmin, (req, res, next) => {
    console.log("📍 Route GET /api/history_activity/product-history/all được gọi");
    next();
}, historyActivityController.getProductHistory);

// DELETE (optional - nếu muốn admin xoá log)
router.delete('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, (req, res, next) => {
    console.log("📍 Route DELETE /api/history_activity/:id được gọi với id:", req.params.id);
    next();
}, historyActivityController.delete);

module.exports = router;