const db = require('../config/db');
const { writeLog } = require('../util/history_activity');

const exportController = {

    // 1. Lấy các sản phẩm có sẵn trong kho (Gom nhóm để Staff chọn)
    getAvailableProduct: async (req, res) => {
        try {
            // Lấy danh sách sản phẩm có tồn kho & chưa hết hạn, JOIN unit để lấy đơn vị tính
            const query = `
                SELECT 
                    p.product_id, 
                    p.product_code, 
                    p.product_name, 
                    u.unit_id,
                    u.unit_name,
                    SUM(pb.quantity) AS total_available
                FROM product p
                JOIN product_batch pb ON p.product_id = pb.product_id
                LEFT JOIN unit u ON p.unit_id = u.unit_id
                WHERE pb.quantity > 0 AND pb.expiry_date >= CURDATE()
                GROUP BY p.product_id, p.product_code, p.product_name, u.unit_id, u.unit_name
                HAVING total_available > 0
                ORDER BY p.product_name ASC
            `;
            const [products] = await db.query(query);
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            console.error("Lỗi getAvailableProduct:", error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    },

    // 2. Hiện lịch sử các phiếu đã xuất
    getAllBatches: async (req, res) => {
        try {
            const query = `
                SELECT 
                    et.*, 
                    u.full_name, 
                    u.username,
                    COALESCE(SUM(etd.export_quantity), 0) as total_quantity,
                    DATE_FORMAT(et.created_at, '%d/%m/%Y %H:%i:%s') as created_at_formatted
                FROM export_ticket et
                JOIN user u ON et.user_id = u.user_id
                LEFT JOIN export_ticket_detail etd ON et.ticket_id = etd.ticket_id
                GROUP BY et.ticket_id, et.total_price, et.note, et.customer, et.user_id, et.created_at, u.full_name, u.username
                ORDER BY et.created_at DESC
            `;
            const [tickets] = await db.query(query);
            res.status(200).json({ success: true, data: tickets });
        } catch (error) {
            console.error("Lỗi getAllBatches:", error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },

    // 2.5. Lấy chi tiết 1 phiếu xuất (xem chi tiết)
    getExportBatchDetail: async (req, res) => {
        const { id } = req.params; // ticket_id
        try {
            // Lấy thông tin phiếu xuất
            const [ticketData] = await db.query(
                `SELECT 
                    et.ticket_id, et.total_price, et.note, et.customer, et.user_id,
                    DATE_FORMAT(et.created_at, '%d/%m/%Y %H:%i:%s') as created_at,
                    u.full_name, u.username
                 FROM export_ticket et
                 JOIN user u ON et.user_id = u.user_id
                 WHERE et.ticket_id = ?`,
                [id]
            );

            if (ticketData.length === 0) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu xuất' });
            }

            const ticket = ticketData[0];

            // Lấy chi tiết sản phẩm trong phiếu xuất - JOIN để lấy tên sản phẩm
            const [details] = await db.query(
                `SELECT 
                    etd.batch_id, 
                    etd.export_quantity, 
                    etd.export_price, 
                    etd.unit_id,
                    pbd.product_id,
                    p.product_name,
                    u.unit_name
                 FROM export_ticket_detail etd
                 LEFT JOIN product_batch_detail pbd ON etd.batch_id = pbd.batch_id
                 LEFT JOIN product p ON pbd.product_id = p.product_id
                 LEFT JOIN unit u ON etd.unit_id = u.unit_id
                 WHERE etd.ticket_id = ?`,
                [id]
            );

            res.status(200).json({ 
                success: true, 
                ticket: ticket,
                details: details 
            });
        } catch (error) {
            console.error("Lỗi getExportBatchDetail:", error);
            res.status(500).json({ success: false, message: 'Lỗi server: ' + error.message });
        }
    },

    // 3. Tạo lô xuất mới - Frontend chỉ gửi danh sách sản phẩm, backend tự chọn lô FEFO (hạn ngắn nhất)
    createExportBatch: async (req, res) => {
        // Lấy user_id từ session
        const user_id = req.session?.user?.id;
        const { note, customer, products } = req.body;
        
        if (!user_id) {
            return res.status(401).json({ success: false, message: 'Không tìm thấy user_id. Vui lòng đăng nhập lại!' });
        }

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, message: 'Danh sách sản phẩm không hợp lệ!' });
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            let total_price = 0;
            for (const item of products) {
                total_price += item.export_quantity * item.export_price;
            }

            const [ticketResult] = await connection.query(
                `INSERT INTO export_ticket (total_price, note, customer, user_id) VALUES (?, ?, ?, ?)`,
                [total_price, note, customer, user_id]
            );
            const ticket_id = ticketResult.insertId;

            // Xử lý từng sản phẩm được chọn
            for (const item of products) {
                // Tìm lô FEFO (hạn ngắn nhất) có sẵn sản phẩm này
                const [fefoResult] = await connection.query(
                    `SELECT pbd.batch_id, pbd.quantity, pbd.expiry_date
                     FROM product_batch_detail pbd
                     WHERE pbd.product_id = ? AND pbd.quantity > 0
                     ORDER BY pbd.expiry_date ASC
                     LIMIT 1`,
                    [item.product_id]
                );

                if (fefoResult.length === 0) {
                    throw new Error(`Sản phẩm ID ${item.product_id} không có tồn kho.`);
                }

                const batch = fefoResult[0];
                const batch_id = batch.batch_id;
                const availableQty = batch.quantity;

                if (availableQty < item.export_quantity) {
                    throw new Error(`Sản phẩm ID ${item.product_id} chỉ có ${availableQty} cái trong lô hạn sớm nhất, bạn yêu cầu xuất ${item.export_quantity} cái.`);
                }

                // Trừ số lượng từ product_batch_detail
                await connection.query(
                    `UPDATE product_batch_detail SET quantity = quantity - ? 
                     WHERE batch_id = ? AND product_id = ?`,
                    [item.export_quantity, batch_id, item.product_id]
                );

                // Lưu chi tiết xuất vào export_ticket_detail
                await connection.query(
                    `INSERT INTO export_ticket_detail (ticket_id, batch_id, export_quantity, export_price, unit_id) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [ticket_id, batch_id, item.export_quantity, item.export_price, item.unit_id]
                );
            }

            await writeLog(req, 'CREATE', 'export_ticket', ticket_id, `Tạo phiếu xuất kho ID: ${ticket_id} cho khách hàng: ${customer || 'Khách lẻ'}`);

            await connection.commit();
            res.status(200).json({ success: true, message: 'Tạo phiếu xuất kho thành công!', ticket_id });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi createExportBatch:", error);
            res.status(400).json({ success: false, message: error.message || 'Lỗi khi tạo phiếu xuất' });
        } finally {
            connection.release();
        }
    },

    // 4. Cập nhật thông tin lô xuất
    updateExportBatch: async (req, res) => {
        const { id } = req.params;
        const { note, customer } = req.body;
        
        try {
            await db.query(
                `UPDATE export_ticket SET note = ?, customer = ? WHERE ticket_id = ?`, 
                [note, customer, id]
            );
            
            await writeLog(req, 'UPDATE', 'export_ticket', id, `Cập nhật thông tin cho phiếu xuất ID: ${id}`);

            res.status(200).json({ success: true, message: 'Cập nhật phiếu xuất thành công' });
        } catch (error) {
            console.error("Lỗi update:", error);
            res.status(500).json({ success: false, message: 'Lỗi server' });
        }
    },
    
    // 5. Xóa lô xuất (Hủy phiếu xuất)
    deleteExportBatch: async (req, res) => {
        const { id } = req.params;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Lấy danh sách batch_id và export_quantity từ export_ticket_detail
            const [details] = await connection.query(
                `SELECT batch_id, export_quantity FROM export_ticket_detail WHERE ticket_id = ?`,
                [id]
            );

            // Với mỗi batch_id, hoàn kho vào product_batch_detail
            for (const detail of details) {
                // Lưu ý: batch_id ở export_ticket_detail tương ứng với batch_id từ product_batch_detail
                // Nhưng chúng ta cần cẩn thận vì có thể có cùng 1 batch_id nhưng khác product_id
                // Trong trường hợp này, chúng ta sẽ hoàn tất cả sản phẩm trong batch đó
                await connection.query(
                    `UPDATE product_batch_detail SET quantity = quantity + ? 
                     WHERE batch_id = ?`,
                    [detail.export_quantity, detail.batch_id]
                );
            }

            // Xóa chi tiết phiếu xuất
            await connection.query(`DELETE FROM export_ticket_detail WHERE ticket_id = ?`, [id]);
            
            // Xóa phiếu xuất
            await connection.query(`DELETE FROM export_ticket WHERE ticket_id = ?`, [id]);

            await writeLog(req, 'DELETE', 'export_ticket', id, `Hủy phiếu xuất và hoàn kho ID: ${id}`);

            await connection.commit();
            res.status(200).json({ success: true, message: 'Hủy phiếu xuất và hoàn kho thành công' });

        } catch (error) {
            await connection.rollback();
            console.error("Lỗi delete:", error);
            res.status(500).json({ success: false, message: 'Lỗi server khi hủy phiếu' });
        } finally {
            connection.release();
        }
    },

};

module.exports = exportController;