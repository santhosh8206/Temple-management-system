const mysql = require('mysql2/promise');

async function insertKovils() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'kms'
        });

        console.log("Inserting kovils...");
        await connection.query(`
          INSERT INTO kovil (kovil_name, created_at) VALUES
          ('Sri Meenakshi Amman Temple', NOW()),
          ('Sri Bala Vinayagar Temple', NOW()),
          ('Seli Amman Temple', NOW()),
          ('Iyyanar Temple', NOW()),
          ('Shivan Kovil', NOW()),
          ('Perumal Kovil', NOW());
        `);

        console.log("Success!");
        await connection.end();
    } catch (error) {
        console.error("Failed:", error);
    }
}

insertKovils();
