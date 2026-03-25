const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const authController = require('../controller/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authController.me);

module.exports = router;