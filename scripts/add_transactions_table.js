const mysql = require('mysql2/promise');

async function createTransactionsTable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  await connection.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      reference VARCHAR(255) UNIQUE NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      type ENUM('SHOP_ORDER', 'EVENT_TICKET', 'WELFARE_CONTRIBUTION') NOT NULL,
      status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("transactions table created successfully.");
  process.exit(0);
}

createTransactionsTable().catch(console.error);
