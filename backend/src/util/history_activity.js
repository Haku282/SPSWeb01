const db = require('../config/db');

/**
 * Hàm ghi log hoạt động vào database
 * @param {Object} req - Đối tượng request từ express (để lấy session và thông tin mạng)
 * @param {String} action - Hành động thực hiện (Ví dụ: 'CREATE', 'UPDATE', 'DELETE', 'LOGIN')
 * @param {String} entity - Đối tượng bị tác động (Ví dụ: 'user', 'product', 'unit')
 * @param {Number|String} entityId - ID của đối tượng bị tác động
 * @param {String} description - Mô tả chi tiết hành động
 */
const writeLog = async (req, action, entity, entityId = null, description = '') => {
    try {
        const userId = req.session?.user?.id || null;
        
        // Lấy IP và User Agent
        const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || req.ip || null;
        const userAgent = req.get('User-Agent') || null;

        // ĐÃ SỬA: Đổi tên bảng thành history_activity
        const sql = `
            INSERT INTO history_activity 
            (user_id, action, entity, entity_id, description, ip, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            userId, 
            action, 
            entity, 
            entityId, 
            description, 
            ip, 
            userAgent
        ]);

        return result;
    } catch (error) {
        console.error('CRITICAL: Failed to write history log:', error.message);
        
        try {
            // ĐÃ SỬA: Đổi tên bảng thành history_activity ở khối fallback
            await db.query(
                'INSERT INTO history_activity (user_id, action, entity, entity_id, description) VALUES (?, ?, ?, ?, ?)',
                [req.session?.user?.id || null, action, entity, entityId, description]
            );
        } catch (e2) {
            console.error('Final fallback failed:', e2.message);
        }
        return null;
    }
};

module.exports = { writeLog };