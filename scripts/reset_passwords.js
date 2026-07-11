const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetPasswords() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  await connection.execute(`UPDATE users SET password = ?`, [hashedPassword]);

  console.log("All passwords reset to 'password123'");
  process.exit(0);
}

resetPasswords().catch(console.error);
