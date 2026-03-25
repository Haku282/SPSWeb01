const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const history_importController = require('../controller/history_importController');

// CREATE
router.post('/', history_importController.create);

// READ
router.get('/', history_importController.read);


module.exports = router;