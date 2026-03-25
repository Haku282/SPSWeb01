const db = require('../config/db');


const logActivity = async (db, userId, action, entity, entityId, description) => {
    try {
        await db.query(
            `INSERT INTO history_activity
            (user_id, action, entity, entity_id, description, created_at)
            VALUES (?, ?, ?, ?, ?, NOW())`,
            [userId, action, entity, entityId, description]
        );
    } catch (error) {
        console.error("Log activity error:", error.message);
    }
};

module.exports = logActivity;