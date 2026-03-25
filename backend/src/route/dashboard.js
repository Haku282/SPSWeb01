const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');
const auth = require('../middleware/authMiddleware');


router.get('/summary', auth.verifyLogin, dashboardController.summary);

module.exports = router;
