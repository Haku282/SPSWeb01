const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const import_batch = require('../controller/import_batchController');

// 🔹 1. LẤY DANH SÁCH LÔ NHẬP HÀNG (GET)
router.get('/', Middleware.verifyLogin, import_batch.getAllBatches);

// 🔹 2. THÊM MỚI LÔ NHẬP HÀNG (POST)
router.post('/', Middleware.verifyLogin, import_batch.createImportBatch);

// 🔹 3. CẬP NHẬT LÔ NHẬP HÀNG (PUT)
router.put('/:id', Middleware.verifyLogin, import_batch.updateImportBatch);

// 🔹 4. XÓA LÔ NHẬP HÀNG (DELETE)
router.delete('/:id', Middleware.verifyLogin, import_batch.deleteImportBatch);

// 🔹 5. LẤY CHI TIẾT LÔ NHẬP HÀNG THEO ID (GET) 
router.get('/:id', Middleware.verifyLogin, import_batch.getBatchDetails);

module.exports = router;