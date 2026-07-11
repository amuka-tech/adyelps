const mysql = require('mysql2/promise');

async function makeAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });
  
  await connection.execute("UPDATE users SET role = 'ADMIN' WHERE id = 1");
  console.log("User 1 set to ADMIN");
  process.exit(0);
}

makeAdmin();
