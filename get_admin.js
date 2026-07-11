const mysql = require('mysql2/promise');

async function getAdmin() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });
  
  const [rows] = await connection.execute("SELECT * FROM users WHERE role = 'ADMIN'");
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

getAdmin();
