const db = require('../config/db');
const { writeLog } = require('../util/history_activity');

const supplierController = {

    // 🔹 1. LẤY DANH SÁCH NHÀ CUNG CẤP (GET)
    getAllSuppliers: async (req, res) => {
        try {
            const [suppliers] = await db.query("SELECT * FROM supplier ORDER BY supplier_id DESC");
            res.status(200).json({ success: true, data: suppliers });
        } catch (error) {
            console.error("Lỗi trong getAllSuppliers:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ!", error: error.message });
        }
    },

    // 🔹 2. THÊM MỚI NHÀ CUNG CẤP (POST)
    createSupplier: async (req, res) => {
        try {
            const { supplier_name, phone, email, address } = req.body;

            // Kiểm tra trường bắt buộc (supplier_name là Not Null)
            if (!supplier_name || supplier_name.trim() === '') {
                return res.status(400).json({ success: false, message: "Tên nhà cung cấp không được để trống!" });
            }

            const cleanName = supplier_name.trim();

            // Kiểm tra xem tên nhà cung cấp đã tồn tại chưa (tùy chọn, nhưng nên có)
            const [existing] = await db.execute(
                'SELECT supplier_id FROM supplier WHERE LOWER(supplier_name) = LOWER(?)', 
                [cleanName]
            );
            if (existing.length > 0) {
                return res.status(400).json({ success: false, message: "Nhà cung cấp này đã tồn tại trong hệ thống!" });
            }

            // Thực hiện thêm mới
            const sql = `INSERT INTO supplier (supplier_name, phone, email, address) VALUES (?, ?, ?, ?)`;
            const [result] = await db.execute(sql, [
                cleanName, 
                phone || null, 
                email || null, 
                address || null
            ]);
            
            const newSupplierId = result.insertId;

            // Ghi Log
            await writeLog(req, 'CREATE', 'supplier', newSupplierId, `Thêm mới nhà cung cấp: ${cleanName}`);

            res.status(201).json({
                success: true,
                message: "Thêm nhà cung cấp thành công!",
                data: { supplier_id: newSupplierId, supplier_name: cleanName, phone, email, address }
            });

        } catch (error) {
            console.error("Lỗi trong createSupplier:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ!" });
        }
    },

    // 🔹 3. CẬP NHẬT NHÀ CUNG CẤP (PUT/PATCH)
    updateSupplier: async (req, res) => {
        try {
            const { id } = req.params;
            const { supplier_name, phone, email, address } = req.body;

            if (!supplier_name || supplier_name.trim() === '') {
                return res.status(400).json({ success: false, message: "Tên nhà cung cấp không được để trống!" });
            }

            const cleanName = supplier_name.trim();

            // Kiểm tra nhà cung cấp có tồn tại không
            const [suppliers] = await db.query("SELECT * FROM supplier WHERE supplier_id = ?", [id]);
            if (suppliers.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp này!" });
            }
            const oldName = suppliers[0].supplier_name;

            // Kiểm tra trùng tên với nhà cung cấp KHÁC
            const [duplicateCheck] = await db.query(
                "SELECT supplier_id FROM supplier WHERE LOWER(supplier_name) = LOWER(?) AND supplier_id != ?", 
                [cleanName, id]
            );
            if (duplicateCheck.length > 0) {
                return res.status(400).json({ success: false, message: "Tên này đã được sử dụng cho một nhà cung cấp khác!" });
            }

            // Thực hiện cập nhật
            const sql = `UPDATE supplier SET supplier_name = ?, phone = ?, email = ?, address = ? WHERE supplier_id = ?`;
            await db.execute(sql, [cleanName, phone || null, email || null, address || null, id]);

            // Ghi Log
            await writeLog(
                req, 'UPDATE', 'supplier', id, 
                `Cập nhật thông tin nhà cung cấp: ${oldName} -> ${cleanName}`
            );

            res.status(200).json({ success: true, message: "Cập nhật nhà cung cấp thành công!" });

        } catch (error) {
            console.error("Lỗi trong updateSupplier:", error);
            res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ!" });
        }
    },

    // 🔹 4. XÓA NHÀ CUNG CẤP (DELETE)
    deleteSupplier: async (req, res) => {
        try {
            const { id } = req.params;

            // Lấy thông tin trước khi xóa để ghi log
            const [suppliers] = await db.query("SELECT supplier_name FROM supplier WHERE supplier_id = ?", [id]);
            if (suppliers.length === 0) {
                return res.status(404).json({ success: false, message: "Không tìm thấy nhà cung cấp!" });
            }
            const deletedName = suppliers[0].supplier_name;

            // Thực hiện xóa
            await db.query("DELETE FROM supplier WHERE supplier_id = ?", [id]);

            // Ghi Log
            await writeLog(req, 'DELETE', 'supplier', id, `Đã xóa nhà cung cấp: ${deletedName}`);

            res.status(200).json({ success: true, message: `Đã xóa nhà cung cấp: ${deletedName}` });

        } catch (error) {
            console.error("Lỗi trong deleteSupplier:", error);
            
            // Xử lý lỗi Khóa Ngoại (Foreign Key)
            // Vì supplier_id đang được dùng trong bảng product_batch và product
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    success: false, 
                    message: "Không thể xóa! Nhà cung cấp này đang có lịch sử giao dịch (nhập hàng) trong hệ thống." 
                });
            }
            
            res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ!" });
        }
    }
};

module.exports = supplierController;