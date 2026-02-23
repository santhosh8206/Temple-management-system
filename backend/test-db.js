const pool = require('./config/db');

async function checkSchema() {
  try {
    const [users] = await pool.query('DESCRIBE users');
    console.log('--- users table schema ---');
    console.log(users);

    const [kovil] = await pool.query('DESCRIBE kovil');
    console.log('--- kovil table schema ---');
    console.log(kovil);
  } catch (err) {
    console.error('Error fetching schema:', err);
  } finally {
    process.exit();
  }
}

checkSchema();
