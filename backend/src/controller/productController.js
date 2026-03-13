const db = require('../config/db');
const fs = require('fs');
const path = require('path');

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

            // Ưu tiên file từ máy tính (multer), nếu không có thì lấy link từ body
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

            res.status(201).json({
                message: "Thêm sản phẩm thành công!",
                product_id: result.insertId
            });

        } catch (error) {
            // Nếu lưu DB lỗi mà đã lỡ upload ảnh thì xóa ảnh đó đi để dọn rác
            if (req.file) deleteFile(req.file.filename);

            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Mã sản phẩm đã tồn tại!" });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // 2. READ PRODUCT
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

            // Bước A: Lấy thông tin sản phẩm cũ để biết tên file ảnh cũ
            const [oldProduct] = await db.query("SELECT image FROM product WHERE product_id = ?", [id]);
            const oldImageName = oldProduct.length > 0 ? oldProduct[0].image : null;

            // Bước B: Xác định ảnh mới
            let finalImage = req.body.image; // Mặc định dùng lại link/tên cũ từ body
            if (req.file) {
                finalImage = req.file.filename; // Nếu có file mới, dùng file mới
                
                // Nếu ảnh cũ là một file (không phải link web) thì xóa file cũ đi cho nhẹ máy
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

            const [result] = await db.query(sql, [
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

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
            }

            res.status(200).json({ message: "Cập nhật sản phẩm thành công!" });

        } catch (error) {
            if (req.file) deleteFile(req.file.filename);
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Mã sản phẩm đã tồn tại!" });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // 4. DELETE PRODUCT (Soft delete)
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Nếu bạn muốn xóa hẳn file ảnh khi xóa sản phẩm, hãy gọi deleteFile ở đây.
            // Nhưng vì đây là Soft Delete (status=0), nên chúng ta cứ giữ lại ảnh.

            const sql = `UPDATE product SET status = 0 WHERE product_id = ?`;
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
            }
            res.status(200).json({ message: "Đã ngừng bán sản phẩm!" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = productController;