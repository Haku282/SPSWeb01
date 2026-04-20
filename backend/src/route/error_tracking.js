const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const errorTracking = require('../controller/errorTrackingController');

// LOG ERROR (Public - có thể gọi từ bất kỳ page nào)
router.post('/log', errorTracking.logError);

// GET ALL ERRORS (Admin only)
router.get('/', Middleware.verifyLogin, Middleware.verifyAdmin, errorTracking.getAllErrors);

// GET ERRORS BY STATUS (Admin only)
router.get('/by-status', Middleware.verifyLogin, Middleware.verifyAdmin, errorTracking.getErrorsByStatus);

// GET ERROR STATISTICS (Admin only)
router.get('/stats', Middleware.verifyLogin, Middleware.verifyAdmin, errorTracking.getErrorStats);

// UPDATE ERROR STATUS (Admin only)
router.put('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, errorTracking.updateErrorStatus);

// DELETE ERROR (Admin only)
router.delete('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, errorTracking.deleteError);

module.exports = router;
