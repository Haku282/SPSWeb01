const db = require('../config/db');
const bcrypt = require('bcrypt');

const authController = {
    // ĐĂNG KÝ (Giữ nguyên logic của bạn, thêm xử lý lỗi tốt hơn)
    register: async (req, res) => {
        try {
            const { username, password, full_name, role } = req.body;
            const [existingUser] = await db.query('SELECT * FROM user WHERE username = ?', [username]);
            
            if (existingUser.length > 0) {
                return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                'INSERT INTO user (username, password, full_name, role) VALUES (?, ?, ?, ?)',
                [username, hashedPassword, full_name, role || 'staff']
            );

            res.status(201).json({ message: "Đăng ký tài khoản thành công!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ĐĂNG NHẬP (Sử dụng Session)
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const [users] = await db.query(
                'SELECT * FROM user WHERE username = ?', 
                [username]
            );

            if (users.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu không chính xác!" });
            }

            // ✅ UPDATE last_login (THÊM Ở ĐÂY)
            await db.query(
                'UPDATE user SET last_login = NOW() WHERE user_id = ?',
                [user.user_id]
            );

            // LƯU VÀO SESSION 
            req.session.user = {
                id: user.user_id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            };

            // Trả về thông tin user
            const { password: pw, ...info } = user;
            res.status(200).json({
                message: "Đăng nhập thành công!",
                sessionId: req.sessionID,
                cookieInfo: req.session.cookie,
                user: {
                    username: user.username,
                    role: user.role
                }
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ĐĂNG XUẤT (Xóa Session)
    logout: (req, res) => {
    // 1. Hủy session trong Database
        req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({ message: "Không thể hủy phiên làm việc!" });
                }
                
                // 2. Xóa Cookie ở trình duyệt (Tên phải khớp với 'key' trong app.js)
                res.clearCookie('pharmacy_sid'); 
                
                // 3. Phản hồi thành công
                return res.status(200).json({ message: "Đăng xuất thành công!" });
        });
    }
};

module.exports = authController;