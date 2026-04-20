const db = require('../config/db');
//Lấy dữ liệu từ bảng history_activity, có thể lọc theo user_id nếu cần

const historyActivityController = {

    // 🔹 READ ALL
    read: async (req, res) => {
        try {
            const sql = `
                SELECT h.*, u.username
                FROM history_activity h
                LEFT JOIN user u ON h.user_id = u.user_id
                ORDER BY h.created_at DESC
            `;

            const [rows] = await db.query(sql);
            
            console.log("📋 Lấy lịch sử hoạt động - Số bản ghi:", rows.length);

            res.status(200).json(rows);

        } catch (error) {
            console.error("❌ Lỗi trong read history:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 READ BY USER
    getByUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Chỉ cho admin xem lịch sử của bất kỳ user nào.
            // User bình thường chỉ được xem lịch sử của chính họ.
            const sessionUser = req.session && req.session.user;
            if (!sessionUser) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }
            
            // Sửa: Dùng sessionUser.id thay vì sessionUser.user_id (đúng với structure của session)
            if (sessionUser.role !== 'admin' && String(sessionUser.id) !== String(userId)) {
                return res.status(403).json({ message: 'Bạn không có quyền xem lịch sử của người khác' });
            }

            const sql = `
                SELECT h.*, u.username
                FROM history_activity h
                LEFT JOIN user u ON h.user_id = u.user_id
                WHERE h.user_id = ?
                ORDER BY h.created_at DESC
            `;

            const [rows] = await db.query(sql, [userId]);
            
            console.log("📋 Lấy lịch sử của user", userId, "- Số bản ghi:", rows.length);

            res.status(200).json(rows);

        } catch (error) {
            console.error("❌ Lỗi trong getByUser:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 DELETE LOG (optional)
    delete: async (req, res) => {
        try {
            const id = req.params.id;

            const [result] = await db.query(
                "DELETE FROM history_activity WHERE id = ?",
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Log không tồn tại!" });
            }

            console.log("🗑️ Xóa log ID:", id, "thành công");
            res.status(200).json({ message: "Xóa log thành công!" });

        } catch (error) {
            console.error("❌ Lỗi khi xóa log:", error);
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 READ PRODUCT HISTORY (Lấy lịch sử thay đổi sản phẩm)
    getProductHistory: async (req, res) => {
        try {
            const sql = `
                SELECT h.*, u.username
                FROM history_activity h
                LEFT JOIN user u ON h.user_id = u.user_id
                WHERE h.entity IN ('product', 'product_batch')
                ORDER BY h.created_at DESC
            `;

            const [rows] = await db.query(sql);

            console.log("📋 Lấy lịch sử sản phẩm - Số bản ghi:", rows.length);

            res.status(200).json(rows);

        } catch (error) {
            console.error("❌ Lỗi trong getProductHistory:", error);
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = historyActivityController;