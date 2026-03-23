const db = require('../config/db');
const fs = require('fs');
const path = require('path');
const logActivity = require('../util/history_activity');

// Hàm hỗ trợ xóa file ảnh trong thư mục uploads
const deleteFile = (fileName) => {
    if (fileName) {
        const filePath = path.join(__dirname, '../uploads/', fileName);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

const productController = {

    // 1. CREATE PRODUCT
    create: async (req, res) => {
        try {
            const {
                product_code,
                product_name,
                category_id,
                unit,
                purchase_price,
                selling_price,
                quantity,
                expiry_date,
                description
            } = req.body;

            const image = req.file ? req.file.filename : req.body.image;

            const sql = `
                INSERT INTO product
                (product_code, product_name, category_id, unit, purchase_price, selling_price, quantity, expiry_date, image, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            `;

            const [result] = await db.query(sql, [
                product_code,
                product_name,
                category_id,
                unit,
                purchase_price,
                selling_price,
                quantity || 0,
                expiry_date || null,
                image,
                description
            ]);

            const newProductId = result.insertId;

            // Nếu có nhập số lượng ban đầu
            if (quantity && Number(quantity) > 0) {
                const insertHistorySql = `
                    INSERT INTO history_import
                    (product_id, product_name, category_id, unit, purchase_price, quantity, image, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 'Nhập kho ban đầu khi tạo sản phẩm')
                `;
                await db.query(insertHistorySql, [
                    newProductId,
                    product_name,
                    category_id,
                    unit,
                    purchase_price,
                    quantity,
                    image
                ]);
            }

            // ✅ LOG
            const currentUser = req.session.user;
            const logDesc = `User ${currentUser.username} created product "${product_name}" (product_id = ${newProductId})`;

            await logActivity(
                db,
                currentUser.id,
                "CREATE",
                "product",
                newProductId,
                logDesc
            );

            res.status(201).json({
                message: "Thêm sản phẩm thành công!",
                product_id: newProductId
            });

        } catch (error) {
            if (req.file) deleteFile(req.file.filename);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Mã sản phẩm đã tồn tại!" });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // 2. READ PRODUCT (không log)
    read: async (req, res) => {
        try {
            const sql = `
                SELECT p.*, c.category_name
                FROM product p
                LEFT JOIN product_category c
                ON p.category_id = c.category_id
                WHERE p.status = 1
                ORDER BY p.created_at DESC
            `;
            const [rows] = await db.query(sql);
            res.status(200).json(rows);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. UPDATE PRODUCT
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                product_code,
                product_name,
                category_id,
                unit,
                purchase_price,
                selling_price,
                quantity,
                expiry_date,
                description
            } = req.body;

            const [oldProduct] = await db.query("SELECT * FROM product WHERE product_id = ?", [id]);

            if (oldProduct.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
            }

            const oldData = oldProduct[0];
            const oldImageName = oldData.image;

            let finalImage = req.body.image;
            if (req.file) {
                finalImage = req.file.filename;
                if (oldImageName && !oldImageName.startsWith('http')) {
                    deleteFile(oldImageName);
                }
            }

            const sql = `
                UPDATE product SET
                    product_code = ?,
                    product_name = ?,
                    category_id = ?,
                    unit = ?,
                    purchase_price = ?,
                    selling_price = ?,
                    quantity = ?,
                    expiry_date = ?,
                    image = ?,
                    description = ?
                WHERE product_id = ?
            `;

            await db.query(sql, [
                product_code,
                product_name,
                category_id,
                unit,
                purchase_price,
                selling_price,
                quantity,
                expiry_date || null,
                finalImage,
                description,
                id
            ]);

            // ✅ LOG
            const currentUser = req.session.user;

            const logDesc = `User ${currentUser.username} updated product "${oldData.product_name}" (product_id = ${id})`;

            await logActivity(
                db,
                currentUser.id,
                "UPDATE",
                "product",
                id,
                logDesc
            );

            res.status(200).json({ message: "Cập nhật sản phẩm thành công!" });

        } catch (error) {
            if (req.file) deleteFile(req.file.filename);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Mã sản phẩm đã tồn tại!" });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // 4. DELETE PRODUCT
    delete: async (req, res) => {
        try {
            const { id } = req.params;

            const [productRows] = await db.query("SELECT * FROM product WHERE product_id = ?", [id]);
            if (productRows.length === 0) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
            }

            const product = productRows[0];
            const imageName = product.image;

            const sql = `DELETE FROM product WHERE product_id = ?`;
            await db.query(sql, [id]);

            if (imageName && !imageName.startsWith('http')) {
                deleteFile(imageName);
            }

            // ✅ LOG
            const currentUser = req.session.user;

            const logDesc = `User ${currentUser.username} deleted product "${product.product_name}" (product_id = ${id})`;

            await logActivity(
                db,
                currentUser.id,
                "DELETE",
                "product",
                id,
                logDesc
            );

            res.status(200).json({ message: "Đã xóa sản phẩm thành công!" });

        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: "Không thể xóa do sản phẩm đã phát sinh lịch sử xuất/nhập kho!" });
            }
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = productController;