const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env.local' });

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'adyel_platform'
  });

  try {
    await connection.execute(`ALTER TABLE users MODIFY account_status ENUM('ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING') DEFAULT 'PENDING'`);
    console.log("account_status updated successfully");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    connection.end();
  }
}

main();
