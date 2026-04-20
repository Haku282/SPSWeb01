const db = require('../config/db');
const { writeLog } = require('../util/history_activity');

const import_batchController = {

    // 1. READ ALL BATCHES (Lấy danh sách các Phiếu Nhập)
    getAllBatches: async (req, res) => {
        try {
            // ĐÃ SỬA: Lấy supplier_id từ b, JOIN với bảng supplier để lấy supplier_name
            const sql = `
                SELECT 
                    b.batch_id, 
                    b.batch_number, 
                    b.supplier_id, 
                    s.supplier_name,
                    b.total_price, 
                    b.create_date,
                    DATE_FORMAT(b.create_date, '%d/%m/%Y %H:%i:%s') as create_date_formatted,
                    b.user_id,
                    u.full_name as creator_name
                FROM product_batch b
                LEFT JOIN user u ON b.user_id = u.user_id
                LEFT JOIN supplier s ON b.supplier_id = s.supplier_id
                ORDER BY b.create_date DESC
            `;
            const [rows] = await db.query(sql);
            res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Lỗi getAllBatches:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // 1.5. READ BATCH DETAILS (Lấy chi tiết và thông tin Product của 1 Phiếu Nhập)
    getBatchDetails: async (req, res) => {
        const { id } = req.params; // batch_id
        try {
            const sql = `
                SELECT 
                    d.batch_detail_id, d.batch_id, d.product_id, d.quantity, d.unit_id, d.import_price, d.expiry_date,
                    p.product_code, p.product_name, p.category_id, p.selling_price, p.image, 
                    p.description, p.active_ingredient, p.supplier_id, s.supplier_name AS product_supplier_name, 
                    p.storage_condition, u.unit_name, c.category_name
                FROM product_batch_detail d
                JOIN product p ON d.product_id = p.product_id
                JOIN unit u ON d.unit_id = u.unit_id
                LEFT JOIN supplier s ON p.supplier_id = s.supplier_id
                LEFT JOIN product_category c ON p.category_id = c.category_id
                WHERE d.batch_id = ?
            `;
            const [rows] = await db.query(sql, [id]);
            // Trả về dạng { success, products } để Frontend xử lý dễ
            res.status(200).json({ success: true, products: rows, data: rows });
        } catch (error) {
            console.error("Lỗi getBatchDetails:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // 2. CREATE BATCH (Tạo Phiếu Nhập -> Tự động tạo mới 1 Product -> Tạo 1 Detail)
    createImportBatch: async (req, res) => {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            const { batch_number, supplier_id, total_price, user_id, products } = req.body;

            if (!products || !Array.isArray(products) || products.length === 0) {
                await connection.rollback();
                return res.status(400).json({ success: false, message: "Danh sách sản phẩm nhập không được trống!" });
            }

            // BƯỚC 1: Insert vào bảng product_batch
            const sqlBatch = `
                INSERT INTO product_batch (batch_number, supplier_id, total_price, user_id) 
                VALUES (?, ?, ?, ?)
            `;
            const [batchResult] = await connection.execute(sqlBatch, [
                batch_number || null, 
                supplier_id || null, 
                total_price || 0, 
                user_id
            ]);
            const newBatchId = batchResult.insertId;

            // BƯỚC 2: Duyệt qua mảng sản phẩm
            for (const item of products) {
                if (!item.product_name || !item.unit_id) {
                    throw new Error("Mỗi sản phẩm nhập phải có tên sản phẩm (product_name) và đơn vị (unit_id).");
                }

                // 2.1: TẠO MỚI LUÔN 1 PRODUCT
                const sqlProduct = `
                    INSERT INTO product 
                    (product_code, product_name, category_id, selling_price, image, description, active_ingredient, supplier_id, storage_condition, unit_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const [productResult] = await connection.execute(sqlProduct, [
                    item.product_code || null, 
                    item.product_name, 
                    item.category_id || null, 
                    item.selling_price || null, 
                    item.image || null, 
                    item.description || null, 
                    item.active_ingredient || null, 
                    item.supplier_id || null, 
                    item.storage_condition || null, 
                    item.unit_id
                ]);
                const newProductId = productResult.insertId;

                // 2.2: Insert Detail
                const sqlDetail = `
                    INSERT INTO product_batch_detail 
                    (batch_id, product_id, manufacture_date, expiry_date, import_price, quantity, unit_id) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `;
                await connection.execute(sqlDetail, [
                    newBatchId,
                    newProductId,
                    item.manufacture_date || null,
                    item.expiry_date || null,
                    item.import_price || 0,
                    item.quantity || 0,
                    item.unit_id
                ]);
            }

            // BƯỚC 3: Commit và Ghi Log
            await connection.commit();
            await writeLog(req, 'CREATE', 'product_batch', newBatchId, `Tạo phiếu nhập kho số ${batch_number || newBatchId} kèm theo ${products.length} bản ghi sản phẩm mới`);

            res.status(201).json({ success: true, message: "Nhập kho thành công!", batch_id: newBatchId });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi createImportBatch:", error);
            res.status(500).json({ success: false, error: error.message });
        } finally {
            connection.release();
        }
    },

    // 3. UPDATE BATCH (Cập nhật thông tin Lô hàng và Sản phẩm tương ứng)
    updateImportBatch: async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const { id } = req.params; 
            const { batch_number, supplier_id, total_price, products } = req.body;

            // 1. Cập nhật thông tin phiếu nhập (Sửa manufacturer thành supplier_id)
            await connection.execute(`
                UPDATE product_batch SET batch_number = ?, supplier_id = ?, total_price = ? WHERE batch_id = ?
            `, [batch_number || null, supplier_id || null, total_price || 0, id]);

            // 2. Cập nhật từng chi tiết VÀ bản ghi product tương ứng
            if (products && Array.isArray(products)) {
                for (const item of products) {
                    if (item.batch_detail_id && item.product_id) {
                        // Update Product (Sửa manufacturer thành supplier_id)
                        await connection.execute(`
                            UPDATE product SET 
                                product_code = ?, product_name = ?, category_id = ?, selling_price = ?, image = ?, description = ?, active_ingredient = ?, supplier_id = ?, storage_condition = ?, unit_id = ?
                            WHERE product_id = ?
                        `, [
                            item.product_code || null, item.product_name, item.category_id || null, item.selling_price || null, item.image || null, item.description || null, item.active_ingredient || null, item.supplier_id || null, item.storage_condition || null, item.unit_id, 
                            item.product_id
                        ]);

                        // Update Batch Detail (Không thay đổi)
                        await connection.execute(`
                            UPDATE product_batch_detail SET 
                                manufacture_date = ?, expiry_date = ?, import_price = ?, quantity = ?, unit_id = ?
                            WHERE batch_detail_id = ?
                        `, [
                            item.manufacture_date || null, item.expiry_date || null, item.import_price || 0, item.quantity || 0, item.unit_id, 
                            item.batch_detail_id
                        ]);
                    }
                }
            }

            await connection.commit();
            await writeLog(req, 'UPDATE', 'product_batch', id, `Cập nhật phiếu nhập kho ID: ${id}`);
            res.status(200).json({ success: true, message: "Cập nhật lô hàng và sản phẩm thành công!" });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi updateImportBatch:", error);
            res.status(500).json({ success: false, error: error.message });
        } finally {
            connection.release();
        }
    },

    // 4. DELETE BATCH (Xóa Phiếu Nhập -> Xóa Chi tiết -> Xóa Product gốc)
    deleteImportBatch: async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();
            const { id } = req.params; 

            // BƯỚC 1: Lấy product_id (nếu có)
            const [details] = await connection.query(`SELECT product_id FROM product_batch_detail WHERE batch_id = ?`, [id]);
            
            const productIds = details.map(d => d.product_id);

            // BƯỚC 2: Xóa detail
            await connection.execute(`DELETE FROM product_batch_detail WHERE batch_id = ?`, [id]);

            // BƯỚC 3: Xóa batch
            const [batchResult] = await connection.execute(`DELETE FROM product_batch WHERE batch_id = ?`, [id]);
            
            // Kiểm tra xem batch có tồn tại không
            if (batchResult.affectedRows === 0) {
                await connection.rollback();
                return res.status(404).json({ success: false, message: "Phiếu nhập không tồn tại!" });
            }

            // BƯỚC 4: Xóa product (nếu có)
            for (const pid of productIds) {
                await connection.execute(`DELETE FROM product WHERE product_id = ?`, [pid]);
            }

            await connection.commit();
            await writeLog(req, 'DELETE', 'product_batch', id, `Đã xóa phiếu nhập kho ID: ${id} và ${productIds.length} bản ghi sản phẩm đi kèm`);

            res.status(200).json({ success: true, message: "Đã xóa toàn bộ phiếu nhập và các bản ghi sản phẩm liên quan!" });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi deleteImportBatch:", error);
            if (error.code === 'ER_ROW_IS_REFERENCED_2') {
                return res.status(400).json({ success: false, message: "Không thể xóa vì các sản phẩm trong lô này đã phát sinh giao dịch xuất kho!" });
            }
            res.status(500).json({ success: false, error: error.message });
        } finally {
            connection.release();
        }
    }

};

module.exports = import_batchController;