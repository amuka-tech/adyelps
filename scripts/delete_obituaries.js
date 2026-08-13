const mysql = require('mysql2/promise');

async function deleteObituaries() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    // Delete dependencies first just in case
    await connection.execute("DELETE FROM condolences");
    // Delete obituaries
    await connection.execute("DELETE FROM obituaries");
    
    console.log("Successfully deleted all obituaries, condolences, and contributions.");
  } catch (err) {
    console.error("Error deleting obituaries:", err);
  } finally {
    await connection.end();
  }
}

deleteObituaries();
