const db = require('../config/db');
const { writeLog } = require('../util/history_activity');


const categoryController = {

    // 🔹 GET ALL (login là xem được)
    read: async (req, res) => {
        try {
            const [categories] = await db.query("SELECT * FROM product_category");
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 CREATE (Manager only)
    create: async (req, res) => {
        try {
            const { category_name, description } = req.body;

            if (!category_name) {
                return res.status(400).json({ message: "Thiếu tên danh mục!" });
            }

            const [result] = await db.query(
                "INSERT INTO product_category (category_name, description) VALUES (?, ?)",
                [category_name, description]
            );

            const newCategoryId = result.insertId;

            // Ghi log hành động tạo mới
            await writeLog(req, 'CREATE', 'product_category', newCategoryId, `Created category: ${category_name}`);

            res.status(201).json({ message: "Tạo category thành công!", category_id: newCategoryId });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 UPDATE (Manager only)
    update: async (req, res) => {
        try {
            const id = req.params.id;
            const { category_name, description } = req.body;

            // Kiểm tra tồn tại và lấy dữ liệu cũ để ghi log chi tiết
            const [category] = await db.query(
                "SELECT * FROM product_category WHERE category_id = ?",
                [id]
            );

            if (category.length === 0) {
                return res.status(404).json({ message: "Category không tồn tại!" });
            }

            const oldName = category[0].category_name;

            await db.query(
                "UPDATE product_category SET category_name = ?, description = ? WHERE category_id = ?",
                [category_name, description, id]
            );

            // Ghi log hành động cập nhật
            await writeLog(
                req, 
                'UPDATE', 
                'product_category', 
                id, 
                `Updated category '${oldName}' to '${category_name}'`
            );

            res.status(200).json({ message: "Cập nhật thành công!" });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 🔹 DELETE (Manager only)
    delete: async (req, res) => {
        try {
            const id = req.params.id;

            // Kiểm tra tồn tại trước khi xóa
            const [category] = await db.query(
                "SELECT * FROM product_category WHERE category_id = ?",
                [id]
            );

            if (category.length === 0) {
                return res.status(404).json({ message: "Category không tồn tại!" });
            }

            const deletedName = category[0].category_name;

            await db.query(
                "DELETE FROM product_category WHERE category_id = ?",
                [id]
            );

            // Ghi log hành động xóa
            await writeLog(
                req, 
                'DELETE', 
                'product_category', 
                id, 
                `Deleted category: ${deletedName}`
            );

            res.status(200).json({ message: "Xóa thành công!" });

        } catch (error) {
            // Lưu ý: Nếu có sản phẩm thuộc category này, SQL sẽ báo lỗi khóa ngoại (Foreign Key Constraint)
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = categoryController;