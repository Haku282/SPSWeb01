const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const historyActivityController = require('../controller/history_activity');

// READ ALL
router.get('/', Middleware.verifyLogin, historyActivityController.read);

// READ BY USER (để lựa xem lại lịch sử hoạt động theo user_id)
router.get('/user/:id', Middleware.verifyLogin, historyActivityController.getByUser);

// DELETE (optional - nếu muốn admin xoá log)
router.delete('/:id', Middleware.verifyLogin, historyActivityController.delete);

module.exports = router;