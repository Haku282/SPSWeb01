const db = require('../config/db');
const logActivity = require('../util/history_activity');

const history_importController = {

    // 1️⃣ CREATE IMPORT BILL

    create: async (req, res) => {
        
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const {
                product_id,
                product_name,
                category_id,
                unit,
                purchase_price,
                quantity,
                image,
                description
            } = req.body;

            // 1. lưu lịch sử nhập
            const insertSql = `
                INSERT INTO history_import
                (product_id, product_name, category_id, unit, purchase_price, quantity, image, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await connection.query(insertSql, [
                product_id,
                product_name,
                category_id,
                unit,
                purchase_price,
                quantity,
                image,
                description
            ]);

            const historyId = result.insertId;

            // 2. tăng số lượng product
            const updateProductSql = `
                UPDATE product
                SET quantity = quantity + ?
                WHERE product_id = ?
            `;

            await connection.query(updateProductSql, [
                quantity,
                product_id
            ]);

            // ✅ COMMIT trước
            await connection.commit();

            // ✅ LOG ACTIVITY (chỉ khi thành công)
            const currentUser = req.session.user;

            const logDesc = `User ${currentUser.username} imported ${quantity} units of product "${product_name}" (product_id = ${product_id})`;

            await logActivity(
                db, // dùng db thường, KHÔNG dùng connection
                currentUser.id,
                "CREATE",
                "history_import",
                historyId,
                logDesc
            );

            res.status(201).json({
                message: "Nhập thuốc thành công!",
                history_id: historyId
            });

        } catch (error) {

            await connection.rollback();

            res.status(500).json({
                error: error.message
            });

        } finally {
            connection.release();
        }
    },


    // 2️⃣ READ IMPORT HISTORY
    read: async (req, res) => {
        try {

            const sql = `
                SELECT h.*, c.category_name
                FROM history_import h
                LEFT JOIN product_category c
                ON h.category_id = c.category_id
                ORDER BY h.created_at DESC
            `;

            const [rows] = await db.query(sql);

            res.status(200).json(rows);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },


};

module.exports = history_importController;