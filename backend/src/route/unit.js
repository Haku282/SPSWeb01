const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const unit = require('../controller/unitController');

// 🔹 GET ALL UNITS (Lấy danh sách tất cả đơn vị tính)
router.get('/', unit.getAllUnits);

// 🔹 CREATE UNIT (Thêm mới đơn vị tính)
router.post('/', unit.createUnit);

// 🔹 UPDATE UNIT (Cập nhật tên đơn vị tính)
router.put('/:id', unit.updateUnit);

// 🔹 DELETE UNIT (Xóa đơn vị tính)
router.delete('/:id', unit.deleteUnit);

module.exports = router;