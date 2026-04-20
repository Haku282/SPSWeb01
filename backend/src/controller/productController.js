const db = require('../config/db');
const { writeLog } = require('../util/history_activity');

const productController = {

    // API Tìm kiếm sản phẩm theo tên
    searchProducts: async (req, res) => {
        try {
            // Lấy từ khóa người dùng gõ từ query string (VD: /api/products/search?keyword=para)
            const { keyword } = req.query;

            // Nếu không có từ khóa, trả về mảng rỗng
            if (!keyword || keyword.trim() === '') {
                return res.status(200).json([]);
            }

            // Thêm dấu % ở 2 đầu để tìm kiếm chứa ký tự (Contains)
            const searchPattern = `%${keyword}%`;

            // Dùng GROUP BY để gom nhóm các sản phẩm trùng tên lại thành 1 dòng duy nhất.
            // Có thể JOIN thêm bảng category để hiển thị cho đẹp.
            const query = `
                SELECT 
                    MAX(p.product_id) as product_id,
                    p.product_name,
                    MAX(p.category_id) as category_id,
                    MAX(c.category_name) as category_name,
                    MAX(p.image) as image,
                    MAX(p.selling_price) as selling_price,
                    MAX(p.description) as description,
                    MAX(p.active_ingredient) as active_ingredient,
                    MAX(p.storage_condition) as storage_condition
                FROM product p
                LEFT JOIN product_category c ON p.category_id = c.category_id
                WHERE p.product_name LIKE ?
                GROUP BY p.product_name
                LIMIT 10
            `;

            const [results] = await db.query(query, [searchPattern]);
            
            res.status(200).json(results);

        } catch (error) {
            console.error("Lỗi khi tìm kiếm sản phẩm:", error);
            res.status(500).json({ error: "Lỗi server khi tìm kiếm." });
        }
    },

    // READ PRODUCT (Dành cho User nhìn - Aggregation theo tên)
    getAllProduct: async (req, res) => {
        try {
            
            const sql = `
                SELECT 
                    MAX(p.product_id) as product_id, 
                    p.product_name,
                    MAX(p.category_id) as category_id,
                    MAX(p.unit_id) as unit_id,
                    MAX(p.product_code) as product_code,
                    MAX(p.image) as image, 
                    MAX(p.description) as description, 
                    MAX(p.selling_price) as selling_price, 
                    MAX(p.supplier_id) as supplier_id, 
                    MAX(s.supplier_name) as supplier_name, 
                    MAX(p.active_ingredient) as active_ingredient, 
                    MAX(p.storage_condition) as storage_condition,
                    MAX(c.category_name) as category_name,
                    MAX(u.unit_name) as unit_name
                FROM product p
                LEFT JOIN product_category c ON p.category_id = c.category_id
                LEFT JOIN unit u ON p.unit_id = u.unit_id
                LEFT JOIN supplier s ON p.supplier_id = s.supplier_id
                GROUP BY p.product_name
                ORDER BY p.product_name ASC
            `;
            console.log("📝 SQL Query:", sql);
            const [rows] = await db.query(sql);
            res.status(200).json(rows);
        } catch (error) {
            console.error("❌ Lỗi trong READ product:", error.message);
            console.error("📋 Stack:", error.stack);
            res.status(500).json({ error: error.message });
        }
    },

    // UPDATE PRODUCT (Cập nhật theo cấu trúc bảng mới)
    updateProduct: async (req, res) => {
        try {

            const { id } = req.params;
            const {
                product_code,
                product_name,
                category_id,
                selling_price,
                image, 
                description,
                active_ingredient,
                supplier_id, 
                storage_condition,
                unit_id
            } = req.body;

            // Kiểm tra tồn tại
            const [oldProducts] = await db.query("SELECT product_name FROM product WHERE product_id = ?", [id]);
            if (oldProducts.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
            }
            const oldName = oldProducts[0].product_name;

            const sql = `
                UPDATE product SET
                    product_code = ?,
                    product_name = ?,
                    category_id = ?,
                    selling_price = ?,
                    image = ?,
                    description = ?,
                    active_ingredient = ?,
                    supplier_id = ?, 
                    storage_condition = ?,
                    unit_id = ?
                WHERE product_id = ?
            `;

            await db.query(sql, [
                product_code,
                product_name,
                category_id,
                selling_price,
                image,
                description,
                active_ingredient,
                supplier_id || null, 
                storage_condition,
                unit_id,
                id
            ]);

            await writeLog(req, 'UPDATE', 'product', id, `Updated info for product: ${oldName}`);

            res.status(200).json({ message: "Cập nhật sản phẩm thành công!" });

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: "Mã sản phẩm đã tồn tại!" });
            }
            res.status(500).json({ error: error.message });
        }
    },

    // DELETE PRODUCT (Hard delete)
    deleteProduct: async (req, res) => {
        try {

            const { id } = req.params;
            
            const [productRows] = await db.query("SELECT product_name, product_code FROM product WHERE product_id = ?", [id]);
            if (productRows.length === 0) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
            }
            const productInfo = productRows[0];

            const sql = `DELETE FROM product WHERE product_id = ?`;
            const [result] = await db.query(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
            }

            await writeLog(req, 'DELETE', 'product', id, `Deleted product: ${productInfo.product_name} (${productInfo.product_code})`);

            res.status(200).json({ message: "Đã xóa sản phẩm thành công!" });
        } catch (error) {
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ message: "Không thể xóa vì sản phẩm này đã có dữ liệu trong các lô hàng (batches)!" });
            }
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = productController;