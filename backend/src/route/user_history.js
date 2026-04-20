const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const user_history = require('../controller/user_historyController');


// Xử lý mua hàng và trừ kho theo lô (FEFO)
router.post('/', Middleware.verifyLogin, user_history.createPurchase);

// LẤY TOÀN BỘ LỊCH SỬ MUA HÀNG ONLINE (DÀNH CHO STAFF/ADMIN)
router.get('/staff', Middleware.verifyLogin, user_history.getAllUser_History);

// Lấy lịch sử mua hàng của user
router.get('/', Middleware.verifyLogin, user_history.getHistoryByUserId);

module.exports = router;