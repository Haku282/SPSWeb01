const db = require('../config/db');

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

            res.status(200).json(rows);

        } catch (error) {
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

            res.status(200).json(rows);

        } catch (error) {
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

            res.status(200).json({ message: "Xóa log thành công!" });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

};

module.exports = historyActivityController;