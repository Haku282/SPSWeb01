const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const supplier = require('../controller/supplierController');

// 🔹 1. LẤY DANH SÁCH NHÀ CUNG CẤP (GET)
router.get('/', Middleware.verifyLogin, supplier.getAllSuppliers);

// 🔹 2. THÊM MỚI NHÀ CUNG CẤP (POST)
router.post('/', Middleware.verifyLogin, Middleware.verifyAdmin, supplier.createSupplier);

// 🔹 3. CẬP NHẬT THÔNG TIN NHÀ CUNG CẤP (PUT)
router.put('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, supplier.updateSupplier);

// 🔹 4. XÓA NHÀ CUNG CẤP (DELETE)
router.delete('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, supplier.deleteSupplier);



module.exports = router;