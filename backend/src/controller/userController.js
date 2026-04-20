const db = require('../config/db');
const bcrypt = require('bcrypt');

const userController = {
    // 1. LẤY DANH SÁCH TẤT CẢ USER (READ)
    getAllUsers: async (req, res) => {
        try {
            const [users] = await db.query('SELECT user_id, username, full_name, role FROM user');
            console.log("📋 Lấy danh sách user - Số bản ghi:", users.length);
            res.status(200).json(users);
        } catch (error) {
            console.error("❌ Lỗi trong getAllUsers:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 2. LẤY CHI TIẾT 1 USER THEO ID (READ)
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const [users] = await db.query('SELECT user_id, username, full_name, role FROM user WHERE user_id = ?', [id]);
            
            if (users.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }
            res.status(200).json(users[0]);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. THÊM MỚI USER (CREATE - Tương tự Register nhưng dành cho Admin)
    createUser: async (req, res) => {
        try {
            const { username, password, full_name, role } = req.body;
            
            // Kiểm tra trùng username
            const [existingUser] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
            if (existingUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const [result] = await db.query(
                'INSERT INTO user (username, password, full_name, role) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, full_name, role || 'user']
            );

            // Ghi log (Nếu bạn có hàm writeLog chung thì nên dùng, ở đây tôi viết inline theo mẫu cũ)
            await db.query(
                'INSERT INTO history_activity (user_id, action, entity, description) VALUES (?, ?, ?, ?)',
                [req.session.user?.id || null, 'CREATE', 'user', `Admin created staff account: ${username}`]
            );

            console.log("✅ Tạo user mới:", username, "- Role:", role || 'user');
            res.status(201).json({ message: "Thêm người dùng thành công!", userId: result.insertId });
        } catch (error) {
            console.error("❌ Lỗi trong createUser:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 4. CẬP NHẬT THÔNG TIN USER (UPDATE)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { full_name, role, password } = req.body;
            
            // Kiểm tra: User chỉ có thể update chính mình (trừ admin có thể update người khác)
            const sessionUserId = req.session.user?.id;
            const isAdmin = req.session.user?.role === 'admin';
            
            if (!isAdmin && String(id) !== String(sessionUserId)) {
                return res.status(403).json({ message: "Bạn chỉ có thể cập nhật tài khoản của chính mình!" });
            }

            // Kiểm tra user có tồn tại không
            const [users] = await db.query('SELECT * FROM user WHERE user_id = ?', [id]);
            if (users.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            let query = 'UPDATE user SET full_name = ?';
            let params = [full_name];

            // Nếu là admin mới được update role, user bình thường không được
            if (isAdmin && role) {
                query += ', role = ?';
                params.push(role);
            }

            // Nếu có đổi mật khẩu thì mã hóa và thêm vào query
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                query += ', password = ?';
                params.push(hashedPassword);
            }

            query += ' WHERE user_id = ?';
            params.push(id);

            await db.query(query, params);

            // Ghi log hành động
            await db.query(
                'INSERT INTO history_activity (user_id, action, entity, description) VALUES (?, ?, ?, ?)',
                [req.session.user?.id || null, 'UPDATE', 'user', `Updated user ID: ${id}`]
            );

            console.log("✅ Cập nhật user ID:", id);
            res.status(200).json({ message: "Cập nhật thông tin thành công!" });
        } catch (error) {
            console.error("❌ Lỗi trong updateUser:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 5. XÓA USER (DELETE)
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Không cho phép tự xóa chính mình (Optional)
            if (req.session.user && req.session.user.id == id) {
                return res.status(400).json({ message: "Bạn không thể tự xóa tài khoản của chính mình!" });
            }

            const [result] = await db.query('DELETE FROM user WHERE user_id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            // Ghi log hành động
            await db.query(
                'INSERT INTO history_activity (user_id, action, entity, description) VALUES (?, ?, ?, ?)',
                [req.session.user?.id || null, 'DELETE', 'user', `Deleted user ID: ${id}`]
            );

            console.log("🗑️ Xóa user ID:", id);
            res.status(200).json({ message: "Xóa người dùng thành công!" });
        } catch (error) {
            console.error("❌ Lỗi trong deleteUser:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = userController;