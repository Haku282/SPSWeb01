const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const productController = require('../controller/productController');

// API Tìm kiếm sản phẩm theo tên (PUBLIC - không cần login)
router.get('/search', productController.searchProducts);

// READ PRODUCT (PUBLIC - User không cần login để xem)
router.get('/', productController.getAllProduct);

// UPDATE PRODUCT (cần login)
router.put('/:id', Middleware.verifyLogin, productController.updateProduct);

// DELETE PRODUCT (cần login)
router.delete('/:id', Middleware.verifyLogin, productController.deleteProduct);

module.exports = router;
