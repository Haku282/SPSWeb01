const db = require('../config/db');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { writeLog } = require('../util/history_activity');

// IMPORT THÊM CÁC THƯ VIỆN NÀY DÀNH CHO TÍNH NĂNG BACKUP
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const adminController = {

    // 🔹 GET ALL USERS
    getAllUsers: async (req, res) => {
        try {
            const [users] = await db.query(
                "SELECT user_id, username, full_name, role, created_at FROM user"
            );

            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 CREATE STAFF
    createStaff: async (req, res) => {
        try {
            const { username, password, full_name } = req.body;

            // 1. Kiểm tra đầu vào
            if (!username || !password || !full_name) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
            }

            // 2. Kiểm tra trùng lặp username
            const [existingUser] = await db.execute('SELECT * FROM user WHERE username = ?', [username]);
            if (existingUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
            }

            // 3. Mã hóa mật khẩu
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // 4. Lưu vào Database
            const sql = `
                INSERT INTO user (username, password, full_name, role, created_at) 
                VALUES (?, ?, ?, 'staff', NOW())
            `;
            const [result] = await db.execute(sql, [username, hashedPassword, full_name]);
            const newStaffId = result.insertId;

            // 5. GHI LOG HOẠT ĐỘNG
            await writeLog(req, 'CREATE', 'user', newStaffId, `Admin created staff account: ${username}`);

            return res.status(201).json({
                message: "Tạo tài khoản nhân viên thành công!",
                data: { user_id: newStaffId, username, full_name, role: 'staff' }
            });

        } catch (error) {
            console.error("Lỗi trong createStaff:", error);
            return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
        }
    },

    // 🔹 UPDATE ROLE
    updateRole: async (req, res) => {
        try {
            const { user_id, role } = req.body;

            if (!user_id || !role) {
                return res.status(400).json({ message: "Thiếu user_id hoặc role!" });
            }

            const validRoles = ['admin', 'staff', 'user'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({ message: "Role không hợp lệ!" });
            }

            const [users] = await db.query("SELECT username, role FROM user WHERE user_id = ?", [user_id]);
            if (users.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }
            
            const oldRole = users[0].role;
            const targetUsername = users[0].username;

            await db.query("UPDATE user SET role = ? WHERE user_id = ?", [role, user_id]);

            // GHI LOG HOẠT ĐỘNG
            await writeLog(
                req, 
                'UPDATE_ROLE', 
                'user', 
                user_id, 
                `Changed role of ${targetUsername} from '${oldRole}' to '${role}'`
            );

            res.status(200).json({ message: `Cập nhật quyền của ${targetUsername} thành công!` });

        } catch (error) {
            console.error("Lỗi trong updateRole:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 CREATE BACKUP FILE
    createBackup: async (req, res) => {
        try {
            // 1. Tạo thư mục backups nếu chưa tồn tại
            const backupsDir = path.join(__dirname, '../backups');
            if (!fs.existsSync(backupsDir)) {
                fs.mkdirSync(backupsDir, { recursive: true });
            }

            // 2. Tạo tên file theo thời gian hiện tại
            const date = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `backup-${date}.sql`;
            const backupPath = path.join(backupsDir, fileName);

            // 3. Lấy thông tin DB từ file môi trường (.env)
            // (Đảm bảo bạn có các biến này trong file .env nhé)
            const dbHost = process.env.DB_HOST ;
            const dbUser = process.env.DB_USER ;
            const dbPassword = process.env.DB_PASS ;
            const dbName = process.env.DB_NAME;
            const dbPort = process.env.DB_PORT;

            // Cấu trúc lệnh mysqldump (chú ý: -p viết liền với password)
            const passwordStr = dbPassword ? `-p${dbPassword}` : '';
            const dumpCommand = `mysqldump -h ${dbHost} -P ${dbPort} -u ${dbUser} ${passwordStr} ${dbName} > "${backupPath}"`;

            // 4. Thực thi lệnh ở cấp độ hệ điều hành
            exec(dumpCommand, async (error, stdout, stderr) => {
                if (error) {
                    console.error("Lỗi khi dump Database:", error.message);
                    // Ghi log thất bại
                    await writeLog(req, 'BACKUP_FAILED', 'system', null, `Failed to create backup: ${error.message}`);
                    return res.status(500).json({ message: "Quá trình sao lưu thất bại." });
                }

                // 5. GHI LOG THÀNH CÔNG
                await writeLog(req, 'BACKUP_SUCCESS', 'system', null, `Admin created database backup file: ${fileName}`);

                // 6. Gửi file về cho Admin tải xuống
                res.download(backupPath, fileName, (downloadErr) => {
                    if (downloadErr) {
                        console.error("Lỗi khi gửi file tải về:", downloadErr.message);
                    }
                    
                    // 7. Xóa file khỏi server ngay sau khi tải xong để tránh đầy ổ cứng
                    fs.unlink(backupPath, (unlinkErr) => {
                        if (unlinkErr) {
                            console.error("Không thể xóa file backup tạm:", unlinkErr.message);
                        }
                    });
                });
            });

        } catch (error) {
            console.error("Lỗi trong createBackup:", error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
        }
    },
};

module.exports = adminController;