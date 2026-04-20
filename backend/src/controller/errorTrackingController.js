const db = require('../config/db');

const errorTrackingController = {
    // 1. LOG ERROR TỪ FRONTEND
    logError: async (req, res) => {
        try {
            const { page, message, timestamp, userAgent, url } = req.body;
            const userId = req.session?.user?.id || null;
            const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || null;

            console.log("📌 Nhận lỗi từ Frontend:", { page, message, userId });

            // Tạo bảng error_logs nếu chưa tồn tại
            const createTableSQL = `
                CREATE TABLE IF NOT EXISTS error_logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    page VARCHAR(100),
                    message TEXT,
                    url TEXT,
                    ip VARCHAR(45),
                    user_agent TEXT,
                    status ENUM('active', 'resolved') DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL
                )
            `;

            await db.query(createTableSQL);

            // Lưu error log
            const sql = `
                INSERT INTO error_logs (user_id, page, message, url, ip, user_agent)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            await db.query(sql, [userId, page, message, url, ip, userAgent]);

            res.status(201).json({ success: true, message: "Lỗi đã được ghi nhận" });

        } catch (error) {
            console.error("❌ Lỗi trong logError:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 2. GET ALL ERRORS (Admin only)
    getAllErrors: async (req, res) => {
        try {
            const sql = `
                SELECT 
                    e.id,
                    e.user_id,
                    u.username,
                    e.page,
                    e.message,
                    e.url,
                    e.ip,
                    e.status,
                    e.created_at
                FROM error_logs e
                LEFT JOIN user u ON e.user_id = u.user_id
                ORDER BY e.created_at DESC
                LIMIT 100
            `;

            const [errors] = await db.query(sql);

            console.log("📋 Lấy danh sách lỗi - Số bản ghi:", errors.length);

            res.status(200).json(errors);

        } catch (error) {
            console.error("❌ Lỗi trong getAllErrors:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 3. GET ERRORS BY STATUS
    getErrorsByStatus: async (req, res) => {
        try {
            const { status } = req.query;
            let sql = `
                SELECT 
                    e.id,
                    e.user_id,
                    u.username,
                    e.page,
                    e.message,
                    e.url,
                    e.status,
                    e.created_at
                FROM error_logs e
                LEFT JOIN user u ON e.user_id = u.user_id
            `;

            if (status && ['active', 'resolved'].includes(status)) {
                sql += ` WHERE e.status = ?`;
            }

            sql += ` ORDER BY e.created_at DESC LIMIT 100`;

            const params = status && ['active', 'resolved'].includes(status) ? [status] : [];
            const [errors] = await db.query(sql, params);

            res.status(200).json(errors);

        } catch (error) {
            console.error("❌ Lỗi trong getErrorsByStatus:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 4. UPDATE ERROR STATUS
    updateErrorStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!['active', 'resolved'].includes(status)) {
                return res.status(400).json({ message: "Status không hợp lệ!" });
            }

            const sql = `UPDATE error_logs SET status = ? WHERE id = ?`;
            const [result] = await db.query(sql, [status, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Lỗi không tồn tại!" });
            }

            console.log("✅ Cập nhật status lỗi ID:", id, "->", status);
            res.status(200).json({ message: "Cập nhật thành công!" });

        } catch (error) {
            console.error("❌ Lỗi trong updateErrorStatus:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 5. DELETE ERROR
    deleteError: async (req, res) => {
        try {
            const { id } = req.params;

            const sql = `DELETE FROM error_logs WHERE id = ?`;
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Lỗi không tồn tại!" });
            }

            console.log("🗑️ Xóa error log ID:", id);
            res.status(200).json({ message: "Xóa thành công!" });

        } catch (error) {
            console.error("❌ Lỗi trong deleteError:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 6. GET ERROR STATISTICS
    getErrorStats: async (req, res) => {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total_errors,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_errors,
                    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_errors,
                    COUNT(DISTINCT page) as affected_pages,
                    COUNT(DISTINCT user_id) as affected_users
                FROM error_logs
            `;

            const [stats] = await db.query(sql);

            console.log("📊 Thống kê lỗi:", stats[0]);

            res.status(200).json(stats[0]);

        } catch (error) {
            console.error("❌ Lỗi trong getErrorStats:", error);
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = errorTrackingController;
