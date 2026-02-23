const mysql = require('mysql2/promise');

async function initializeDatabase() {
  try {
    console.log("Connecting to MySQL server...");
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
    });

    console.log("Creating database 'kms' if it doesn't exist...");
    await connection.query("CREATE DATABASE IF NOT EXISTS kms;");

    console.log("Using database 'kms'...");
    await connection.query("USE kms;");

    console.log("Creating table 'kovil'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS kovil (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kovil_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Creating table 'users'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(150),
        lastname VARCHAR(150),
        amount DECIMAL(12,2),
        dates DATE,
        kovil_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kovil_id) REFERENCES kovil(id)
      );
    `);

    console.log("Creating table 'expenses'...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        amount DECIMAL(12,2) NOT NULL,
        kovil_id INT NOT NULL,
        bill_image VARCHAR(500) NOT NULL,
        dates DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kovil_id) REFERENCES kovil(id)
      );
    `);

    console.log("Inserting a sample kovil dummy record to link to...");
    try {
      await connection.query("INSERT INTO kovil (id, kovil_name) VALUES (1, 'Sri Meenakshi Amman Temple') ON DUPLICATE KEY UPDATE kovil_name=kovil_name;");
    } catch (err) {
      console.log("Dummy record already exists.");
    }

    console.log("Database initialized successfully!");
    await connection.end();
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

initializeDatabase();
