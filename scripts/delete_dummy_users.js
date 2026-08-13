const mysql = require('mysql2/promise');

async function deleteDummyUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    // We disable foreign key checks temporarily so we can delete users.
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Delete users with dummy emails (e.g. ends with @adyel.ac.ug) AND role = 'MEMBER'
    const [result] = await connection.query(`DELETE FROM users WHERE email LIKE '%@adyel.ac.ug' AND role = 'MEMBER'`);
    
    console.log(`Deleted ${result.affectedRows} dummy users.`);

    // 2. Clean up orphaned records
    await connection.query(`DELETE FROM condolences WHERE user_id NOT IN (SELECT id FROM users)`);
    await connection.query(`DELETE FROM audit_logs WHERE user_id NOT IN (SELECT id FROM users)`);
    await connection.query(`DELETE FROM businesses WHERE owner_id NOT IN (SELECT id FROM users)`);
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Cleaned up orphaned records successfully.');

  } catch (error) {
    console.error('Error deleting dummy users:', error);
  } finally {
    await connection.end();
  }
}

deleteDummyUsers();
