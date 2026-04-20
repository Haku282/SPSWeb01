const router = require('express').Router();
const adminController = require('../controller/adminController');
const backupController = require('../controller/backupController');
const auth = require('../middleware/authMiddleware');


// 🔹 GET ALL USERS (Manager only)
router.get('/', auth.verifyLogin, auth.verifyAdmin, adminController.getAllUsers);

//CREATE STAFF
router.post('/staff', auth.verifyLogin, auth.verifyAdmin, adminController.createStaff);

//UPDATE Role
router.put('/role', auth.verifyLogin, auth.verifyAdmin, adminController.updateRole);

//CREATE BACKUP DATABASE FILE (Original - using mysqldump)
router.get('/backup', auth.verifyLogin, auth.verifyAdmin, adminController.createBackup);

//CREATE BACKUP DATABASE FILE (Alternative - using Node.js)
router.get('/backup-alternative', auth.verifyLogin, auth.verifyAdmin, backupController.createBackupAlternative);

module.exports = router;