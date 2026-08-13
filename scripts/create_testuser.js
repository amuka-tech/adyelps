const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createTestUser() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Replace if you have a password
    database: 'adyeldb' // Replace if different
  });

  try {
    const email = 'testuser@adyel.com';
    const passwordHash = await bcrypt.hash('Test2026!', 10);

    const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
    
    if (rows.length === 0) {
      const [result] = await connection.execute(`
        INSERT INTO users (first_name, last_name, email, password, role) 
        VALUES (?, ?, ?, ?, 'MEMBER')
      `, ['Test', 'User', email, passwordHash]);
      
      console.log('Created test user:', email, 'with ID:', result.insertId);
      console.log('Password is: Test2026!');
    } else {
      console.log('Test user already exists:', email, 'with ID:', rows[0].id);
      console.log('Password should be: Test2026!');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await connection.end();
  }
}

createTestUser();
