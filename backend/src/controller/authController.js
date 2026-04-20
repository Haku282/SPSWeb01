const db = require('../config/db');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { writeLog } = require('../util/history_activity');


const notifyAdminLogin = async (employeeName) => {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const adminChatId = process.env.ADMIN_CHAT_ID;

    if (!botToken || !adminChatId) {
        return;
    }

    const message = `Nhân viên ${employeeName} vừa đăng nhập vào hệ thống.`;

    try {
        await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: adminChatId,
            text: message,
        });
    } catch (error) {
        console.error('Telegram notification failed:', error.message);
    }
};

const authController = {
    // ĐĂNG KÝ
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
                [username, hashedPassword, full_name, role || 'user']
            );

            res.status(201).json({ message: "Đăng ký tài khoản thành công!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ĐĂNG NHẬP
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const [users] = await db.query('SELECT * FROM user WHERE username = ?', [username]);

            if (users.length === 0) {
                return res.status(404).json({ message: "Người dùng không tồn tại!" });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) {
                return res.status(400).json({ message: "Mật khẩu không chính xác!" });
            }

            // LƯU VÀO SESSION 
            req.session.user = {
                id: user.user_id,
                username: user.username,
                role: user.role,
                full_name: user.full_name
            };

            await notifyAdminLogin(user.full_name || user.username);

            // Ghi log vào bảng history_activity: hành động LOGIN
            try {
                const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || null;
                const userAgent = req.get('User-Agent') || null;
                const [insertRes] = await db.query(
                    'INSERT INTO history_activity (user_id, action, entity, description, ip, user_agent) VALUES (?, ?, ?, ?, ?, ?)',
                    [user.user_id, 'LOGIN', 'auth', `User ${user.username} logged in`, ip, userAgent]
                );
                console.log('History INSERT (login) result:', insertRes);
            } catch (e) {
                console.error('Failed to write login history (with ip/user_agent):', e.message);
                try {
                    const [insertRes2] = await db.query(
                        'INSERT INTO history_activity (user_id, action, entity, description) VALUES (?, ?, ?, ?)',
                        [user.user_id, 'LOGIN', 'auth', `User ${user.username} logged in`]
                    );
                    console.log('History INSERT (login) fallback result:', insertRes2);
                } catch (e2) {
                    console.error('Failed to write login history (fallback):', e2.message);
                }
            }

            const { password: pw, ...info } = user;
            
            // ÉP LƯU SESSION VÀO DB TRƯỚC KHI TRẢ VỀ FRONTEND
            req.session.save((err) => {
                if (err) {
                    console.error("Lỗi khi lưu session:", err);
                    return res.status(500).json({ message: "Lỗi hệ thống khi tạo phiên làm việc." });
                }

                // Chạy đến đây nghĩa là Session đã nằm gọn trong MySQL
                res.status(200).json({
                    message: "Đăng nhập thành công!",
                    sessionId: req.sessionID, 
                    cookieInfo: req.session.cookie, 
                    user: {
                        user_id: user.user_id,
                        username: user.username,
                        role: user.role,
                        full_name: user.full_name
                    }
                });
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ĐĂNG XUẤT
    logout: async (req, res) => {
        try {
            // 1. Kiểm tra xem session có tồn tại không
            const sessionUser = req.session ? req.session.user : null;

            // 2. Ghi log LOGOUT vào database (Sử dụng hàm util)
            if (sessionUser) {
                // Lưu ý: Gọi writeLog TRƯỚC KHI hủy session để lấy được userId từ req
                await writeLog(
                    req, 
                    'LOGOUT', 
                    'auth', 
                    sessionUser.id, 
                    `User ${sessionUser.username} logged out`
                );
            }

            // 3. Tiến hành hủy session
            req.session.destroy((err) => {
                if (err) {
                    console.error('Lỗi khi hủy session:', err);
                    return res.status(500).json({ message: "Không thể hủy phiên làm việc!" });
                }
                
                // 4. Xóa Cookie ở trình duyệt
                res.clearCookie('pharmacy_sid'); 
                
                // 5. Phản hồi thành công
                return res.status(200).json({ message: "Đăng xuất thành công!" });
            });
        } catch (error) {
            console.error('Logout error:', error.message);
            return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình đăng xuất." });
        }
    },

    // GET current session user
    me: (req, res) => {
        if (req.session && req.session.user) {
            return res.status(200).json({ user: req.session.user });
        }
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
};

module.exports = authController;