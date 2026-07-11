const mysql = require('mysql2/promise');

async function removeFees() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb',
  });

  try {
    const [result] = await connection.query(`
      UPDATE deduction_rates 
      SET is_active = 0 
      WHERE name IN ('Bank Withdrawal Fee', 'Processing Fee', 'Funeral Fund', 'Annual Dues')
    `);
    console.log("Fees deactivated successfully:", result.affectedRows, "rows updated.");
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await connection.end();
  }
}

removeFees();
