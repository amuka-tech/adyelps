const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  const email = 'superadmin@adyel.com';
  const password = await bcrypt.hash('Admin2026!', 10);

  const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
  let userId;

  if (rows.length === 0) {
    const [result] = await connection.execute(
      'INSERT INTO users (id, first_name, last_name, email, password, role, class_year, profession, account_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'System', 'Administrator', email, password, 'SUPER_ADMIN', 2000, 'N/A', 'ACTIVE']
    );
    const [newRows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    userId = newRows[0].id;
    console.log("Created user:", email);
  } else {
    userId = rows[0].id;
    console.log("User already exists:", email);
  }

  // Insert into user_roles mapping
  try {
    await connection.execute(
      'INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)',
      [userId, 1] // 1 is SUPER_ADMIN
    );
    console.log("Assigned SUPER_ADMIN role.");
  } catch (err) {
    console.error("Error assigning role:", err);
  }

  await connection.end();
}

main().catch(console.error);
