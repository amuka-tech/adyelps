const mysql = require('mysql2/promise');

async function updateDB() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    // 1. Alter the ENUM
    console.log("Altering 'role' ENUM to include SUPER_ADMIN...");
    await connection.execute(`
      ALTER TABLE users 
      MODIFY COLUMN role ENUM('MEMBER', 'ADMIN', 'TREASURER', 'SUPER_ADMIN') DEFAULT 'MEMBER'
    `);
    
    // 2. Upgrade the first Admin to Super Admin (or create one if needed)
    console.log("Upgrading an admin to SUPER_ADMIN...");
    await connection.execute(`
      UPDATE users SET role = 'SUPER_ADMIN' WHERE role = 'ADMIN' LIMIT 1
    `);

    console.log("Database update successful!");
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await connection.end();
  }
}

updateDB();
