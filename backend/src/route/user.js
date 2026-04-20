const express = require('express');
const router = express.Router();
const Middleware = require('../middleware/authMiddleware');
const user = require('../controller/userController');

// 🔹 GET ALL USERS (Lấy danh sách tất cả người dùng - Admin only)
router.get('/', Middleware.verifyLogin, Middleware.verifyAdmin, user.getAllUsers);

// 🔹 GET USER BY ID (Lấy thông tin người dùng theo ID - Admin only)
router.get('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, user.getUserById);

// 🔹 CREATE USER (Thêm mới người dùng - Admin only)
router.post('/', Middleware.verifyLogin, Middleware.verifyAdmin, user.createUser);

// 🔹 UPDATE USER (Cập nhật thông tin người dùng - Admin only)
router.put('/:id', Middleware.verifyLogin, user.updateUser);

// 🔹 DELETE USER (Xóa người dùng - Admin only)
router.delete('/:id', Middleware.verifyLogin, Middleware.verifyAdmin, user.deleteUser);

module.exports = router;