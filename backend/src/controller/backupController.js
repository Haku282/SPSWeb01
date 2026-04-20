const db = require('../config/db');
const { writeLog } = require('../util/history_activity');

// CONTROLLER CHO BACKUP THAY THẾ (Không dùng mysqldump)
const backupControllerAlternative = {

    // 🔹 CREATE BACKUP VIA NODE.JS (Not using mysqldump)
    createBackupAlternative: async (req, res) => {
        try {
            console.log("📦 Bắt đầu backup cơ sở dữ liệu...");

            // 1. Lấy tất cả bảng
            const [tables] = await db.query("SHOW TABLES");
            console.log(`📊 Tìm thấy ${tables.length} bảng`);

            if (tables.length === 0) {
                return res.status(400).json({ 
                    message: "Database không có bảng nào!", 
                    error: "No tables found" 
                });
            }

            // 2. Tạo SQL dump content
            let sqlContent = "-- Database Backup\n";
            sqlContent += `-- Ngày: ${new Date().toISOString()}\n`;
            sqlContent += `-- Số bảng: ${tables.length}\n\n`;

            // 3. Lặp qua từng bảng để lấy schema và data
            for (const tableRow of tables) {
                const tableName = tableRow[Object.keys(tableRow)[0]];
                console.log(`⏳ Backing up table: ${tableName}`);

                try {
                    // Lấy CREATE TABLE statement
                    const [createTableResult] = await db.query(`SHOW CREATE TABLE ${tableName}`);
                    if (createTableResult && createTableResult.length > 0) {
                        const createTableSQL = createTableResult[0]['Create Table'];
                        sqlContent += `\n-- =====================\n`;
                        sqlContent += `-- Table: ${tableName}\n`;
                        sqlContent += `-- =====================\n`;
                        sqlContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
                        sqlContent += createTableSQL + ";\n\n";
                    }

                    // Lấy tất cả data từ bảng
                    const [data] = await db.query(`SELECT * FROM ${tableName}`);
                    if (data && data.length > 0) {
                        sqlContent += `-- Data for table: ${tableName}\n`;
                        for (const row of data) {
                            const columns = Object.keys(row);
                            const values = columns.map(col => {
                                const value = row[col];
                                if (value === null) {
                                    return 'NULL';
                                } else if (typeof value === 'string') {
                                    return `'${value.replace(/'/g, "''")}'`;
                                } else if (Buffer.isBuffer(value)) {
                                    return `X'${value.toString('hex')}'`;
                                } else {
                                    return value;
                                }
                            });
                            const insertSQL = `INSERT INTO \`${tableName}\` (\`${columns.join('`,`')}\`) VALUES (${values.join(',')});`;
                            sqlContent += insertSQL + "\n";
                        }
                        sqlContent += "\n";
                    }
                } catch (tableError) {
                    console.error(`⚠️  Lỗi backup table ${tableName}:`, tableError.message);
                    sqlContent += `-- ⚠️  Error backing up ${tableName}: ${tableError.message}\n\n`;
                }
            }

            // 4. Ghi log thành công
            await writeLog(req, 'BACKUP_SUCCESS', 'system', null, `Admin created database backup via Node.js`);

            // 5. Gửi file về client
            const fileName = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(Buffer.from(sqlContent, 'utf-8'));

            console.log(`✅ Backup thành công! File size: ${sqlContent.length} bytes`);

        } catch (error) {
            console.error("❌ Lỗi trong createBackupAlternative:", error);
            
            // Ghi log thất bại
            try {
                await writeLog(req, 'BACKUP_FAILED', 'system', null, `Backup failed: ${error.message}`);
            } catch (logError) {
                console.error("Lỗi khi ghi log thất bại:", logError);
            }

            res.status(500).json({ 
                message: "Lỗi khi tạo backup!",
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    },
};

module.exports = backupControllerAlternative;
