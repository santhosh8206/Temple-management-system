const mysql = require('mysql2/promise');

async function fixDuplicateKovils() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'kms'
    });

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Delete Sri Meenakshi Amman Temple duplicate (ID: 2)
    await conn.query('DELETE FROM kovil WHERE id = 2');

    // Update the users who might be attached to ID 2 back to ID 1
    await conn.query('UPDATE users SET kovil_id = 1 WHERE kovil_id = 2');

    // Shift all remaining kovils (IDs > 2) down by 1 so the IDs are continuous
    await conn.query('UPDATE kovil SET id = id - 1 WHERE id > 2');

    // Shift all associated users' kovil_id references equally to match
    await conn.query('UPDATE users SET kovil_id = kovil_id - 1 WHERE kovil_id > 2');

    // Reset auto-increment
    const [kovils] = await conn.query('SELECT COUNT(*) as count FROM kovil');
    const newAutoIncrement = kovils[0].count + 1;
    await conn.query('ALTER TABLE kovil AUTO_INCREMENT = ?', [newAutoIncrement]);

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log("Successfully removed duplicate Sri Meenakshi Amman Temple and shifted IDs sequentially!");

    conn.end();
}

fixDuplicateKovils().catch(console.error);
