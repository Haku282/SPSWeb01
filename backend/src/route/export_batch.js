const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const export_batch = require('../controller/export_batchController');

// Lấy danh sách sản phẩm có sẵn trong kho để xuất
router.get('/available', Middleware.verifyLogin, export_batch.getAvailableProduct);

// Lấy lịch sử các phiếu xuất
router.get('/', Middleware.verifyLogin, export_batch.getAllBatches);

// Lấy chi tiết 1 phiếu xuất
router.get('/:id', Middleware.verifyLogin, export_batch.getExportBatchDetail);

// Tạo phiếu xuất mới
router.post('/', Middleware.verifyLogin, export_batch.createExportBatch);

// Cập nhật phiếu xuất (nếu cần thiết)
router.put('/:id', Middleware.verifyLogin, export_batch.updateExportBatch);

// Xóa phiếu xuất (nếu cần thiết)
router.delete('/:id', Middleware.verifyLogin, export_batch.deleteExportBatch);


module.exports = router;