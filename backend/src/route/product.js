const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const productController = require('../controller/productController');
const upload = require('../middleware/upload'); // 1. Import middleware upload bạn đã tạo

// CREATE - Thêm upload.single('image')
// 'image' phải trùng với tên field bạn gửi từ FormData ở Frontend
// router.post('/', upload.single('image'), productController.create);

// GET tất cả sản phẩm
router.get('/', Middleware.verifyLogin ,productController.read);

// UPDATE - Thêm upload.single('image')
router.put('/:id', Middleware.verifyAdmin , upload.single('image'), productController.update);

// DELETE
router.delete('/:id', Middleware.verifyAdmin, productController.delete);

module.exports = router;