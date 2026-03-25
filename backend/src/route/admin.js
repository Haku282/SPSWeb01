const router = require('express').Router();
const adminController = require('../controller/adminController');
const auth = require('../middleware/authMiddleware');


//GET tất cả người dùng (chỉ admin mới xem được)
router.get('/', auth.verifyLogin, auth.verifyAdmin, adminController.getAllUsers);


//PUT cập nhật Role (chỉ admin mới được cập nhật)
router.put('/role', auth.verifyLogin, auth.verifyAdmin, adminController.updateRole);

module.exports = router;