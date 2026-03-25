const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboardController');

router.get('/summary', dashboardController.summary);

module.exports = router;
