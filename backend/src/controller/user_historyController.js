const db = require('../config/db');

const userHistoryController = {
    // 1. LẤY LỊCH SỬ MUA HÀNG
    getHistoryByUserId: async (req, res) => {
        try {
            const userId = req.session.user.id;
            const query = `
                SELECT uh.*, p.product_name 
                FROM user_history uh
                JOIN product p ON uh.product_id = p.product_id
                WHERE uh.user_id = ?
                ORDER BY uh.date DESC
            `;
            const [history] = await db.query(query, [userId]);
            res.status(200).json(history);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. XỬ LÝ MUA HÀNG THEO PRODUCT_ID (TRỪ FEFO & LƯU USER_HISTORY)
    createPurchase: async (req, res) => {
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Nhận product_id trực tiếp từ frontend
            const { product_id, unit_name, quantity, address, total_price, payment } = req.body;
            const user_id = req.session.user.id;
            let amountToSubtract = parseInt(quantity);

            // BƯỚC 1: Tìm tất cả các lô của product_id này, sắp xếp theo ngày hết hạn gần nhất (FEFO)
            const [batches] = await connection.query(
                `SELECT batch_detail_id, product_id, quantity as stock, expiry_date 
                 FROM product_batch_detail 
                 WHERE product_id = ? AND quantity > 0 
                 ORDER BY expiry_date ASC`,
                [product_id]
            );

            if (batches.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: "Sản phẩm này không có tồn kho!" });
            }

            // Kiểm tra tổng số lượng tồn kho của tất cả các lô
            const totalStock = batches.reduce((sum, b) => sum + b.stock, 0);
            if (totalStock < amountToSubtract) {
                await connection.rollback();
                return res.status(400).json({ message: `Tồn kho không đủ! Hiện còn: ${totalStock} ${unit_name}` });
            }

            // BƯỚC 2: Trừ dần số lượng vào từng lô theo nguyên tắc FEFO
            for (let batch of batches) {
                if (amountToSubtract <= 0) break;

                let take = Math.min(batch.stock, amountToSubtract);
                
                await connection.query(
                    'UPDATE product_batch_detail SET quantity = quantity - ? WHERE batch_detail_id = ?',
                    [take, batch.batch_detail_id]
                );

                amountToSubtract -= take;
            }

            // BƯỚC 3: Lưu vào user_history
            await connection.query(
                `INSERT INTO user_history 
                (user_id, product_id, unit_name, quantity, address, total_price, payment, date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
                [user_id, product_id, unit_name, quantity, address, total_price, payment]
            );

            await connection.commit();
            res.status(201).json({ 
                message: "Mua hàng thành công!",
                details: "Đã trừ kho thành công dựa trên ngày hết hạn." 
            });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi mua hàng:", error);
            res.status(500).json({ error: "Đã xảy ra lỗi trong quá trình xử lý đơn hàng." });
        } finally {
            // Luôn release connection dù thành công hay lỗi
            connection.release();
        }
    },

    // 3. LẤY TOÀN BỘ LỊCH SỬ BÁN HÀNG ONLINE (DÀNH CHO STAFF/ADMIN)
    getAllUser_History: async (req, res) => {
        try {
            const query = `
                SELECT 
                    uh.user_history_id,
                    uh.quantity,
                    uh.unit_name,
                    uh.address,
                    uh.total_price,
                    uh.payment,
                    uh.date,
                    DATE_FORMAT(uh.date, '%d/%m/%Y %H:%i:%s') as date_formatted,
                    u.username,
                    p.product_name 
                FROM user_history uh
                JOIN user u ON uh.user_id = u.user_id
                JOIN product p ON uh.product_id = p.product_id
                ORDER BY uh.date DESC
            `;
            const [history] = await db.query(query);
            
            res.status(200).json(history);
        } catch (error) {
            console.error("Lỗi lấy toàn bộ lịch sử bán hàng online:", error);
            res.status(500).json({ error: "Đã xảy ra lỗi khi lấy danh sách lịch sử bán hàng." });
        }
    }
};

module.exports = userHistoryController;