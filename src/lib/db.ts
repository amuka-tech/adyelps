import mysql from 'mysql2/promise';

// Create the connection pool. The pool-specific settings are the defaults
export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP has no password
  database: 'adyeldb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function query(sql: string, values: any[] = []) {
  try {
    const [results] = await pool.query(sql, values);
    return results;
  } catch (error) {
    console.error('Database Error: ', error);
    throw error;
  }
}
