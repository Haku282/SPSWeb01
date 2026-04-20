const db = require('../config/db');
const { writeLog } = require('../util/history_activity');

const unitController = {

    // 🔹 1. GET ALL UNITS (Lấy danh sách tất cả đơn vị tính)
    getAllUnits: async (req, res) => {
        try {
            const [units] = await db.query("SELECT * FROM unit ORDER BY unit_id DESC");
            res.status(200).json(units);
        } catch (error) {
            console.error("Lỗi trong getAllUnits:", error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ!", error: error.message });
        }
    },

    // 🔹 2. CREATE UNIT (Thêm mới đơn vị tính)
    createUnit: async (req, res) => {
        try {
            const { unit_name } = req.body;

            // Kiểm tra đầu vào
            if (!unit_name || unit_name.trim() === '') {
                return res.status(400).json({ message: "Vui lòng nhập tên đơn vị tính!" });
            }

            const cleanName = unit_name.trim();

            // Kiểm tra trùng lặp (không phân biệt hoa thường)
            const [existingUnit] = await db.execute(
                'SELECT * FROM unit WHERE LOWER(unit_name) = LOWER(?)', 
                [cleanName]
            );
            if (existingUnit.length > 0) {
                return res.status(400).json({ message: "Đơn vị tính này đã tồn tại!" });
            }

            // Lưu vào Database
            const sql = `INSERT INTO unit (unit_name) VALUES (?)`;
            const [result] = await db.execute(sql, [cleanName]);
            const newUnitId = result.insertId;

            // Ghi Log Hoạt Động
            await writeLog(req, 'CREATE', 'unit', newUnitId, `Created new unit: ${cleanName}`);

            return res.status(201).json({
                message: "Thêm đơn vị tính thành công!",
                data: { unit_id: newUnitId, unit_name: cleanName }
            });

        } catch (error) {
            console.error("Lỗi trong createUnit:", error);
            return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
        }
    },

    // 🔹 3. UPDATE UNIT (Cập nhật tên đơn vị tính)
    updateUnit: async (req, res) => {
        try {
            const { id } = req.params; // Lấy ID từ URL (VD: /api/units/5)
            const { unit_name } = req.body;

            if (!unit_name || unit_name.trim() === '') {
                return res.status(400).json({ message: "Tên đơn vị tính không được để trống!" });
            }

            const cleanName = unit_name.trim();

            // Kiểm tra đơn vị có tồn tại không
            const [units] = await db.query("SELECT * FROM unit WHERE unit_id = ?", [id]);
            if (units.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy đơn vị tính này!" });
            }
            const oldName = units[0].unit_name;

            // Kiểm tra xem tên mới có bị trùng với một unit KHÁC không
            const [duplicateCheck] = await db.query(
                "SELECT * FROM unit WHERE LOWER(unit_name) = LOWER(?) AND unit_id != ?", 
                [cleanName, id]
            );
            if (duplicateCheck.length > 0) {
                return res.status(400).json({ message: "Tên đơn vị tính này đã được sử dụng!" });
            }

            // Thực hiện cập nhật
            await db.query("UPDATE unit SET unit_name = ? WHERE unit_id = ?", [cleanName, id]);

            // Ghi Log Hoạt Động
            if (oldName !== cleanName) {
                await writeLog(
                    req, 
                    'UPDATE', 
                    'unit', 
                    id, 
                    `Changed unit name from '${oldName}' to '${cleanName}'`
                );
            }

            res.status(200).json({ message: "Cập nhật đơn vị tính thành công!" });

        } catch (error) {
            console.error("Lỗi trong updateUnit:", error);
            res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
        }
    },

    // 🔹 4. DELETE UNIT (Xóa đơn vị tính)
    deleteUnit: async (req, res) => {
        try {
            const { id } = req.params;

            // Lấy thông tin để ghi log trước khi xóa
            const [units] = await db.query("SELECT unit_name FROM unit WHERE unit_id = ?", [id]);
            if (units.length === 0) {
                return res.status(404).json({ message: "Không tìm thấy đơn vị tính!" });
            }
            const deletedName = units[0].unit_name;

            // THẬN TRỌNG: Xóa dữ liệu (Thực tế nên kiểm tra xem Unit này đã được dùng trong bảng Product chưa)
            // Lệnh dưới đây là xóa cứng (Hard delete)
            await db.query("DELETE FROM unit WHERE unit_id = ?", [id]);

            // Ghi Log Hoạt Động
            await writeLog(req, 'DELETE', 'unit', id, `Deleted unit: ${deletedName}`);

            res.status(200).json({ message: `Đã xóa đơn vị tính: ${deletedName}` });

        } catch (error) {
            console.error("Lỗi trong deleteUnit:", error);
            
            // Xử lý lỗi khóa ngoại (Foreign Key Constraint)
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ 
                    message: "Không thể xóa! Đơn vị tính này đang được sử dụng cho một số sản phẩm." 
                });
            }
            
            res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
        }
    }
};

module.exports = unitController;