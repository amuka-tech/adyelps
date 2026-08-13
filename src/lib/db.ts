import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

// Initialize the database connection
export async function getDb(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: path.join(process.cwd(), 'database.sqlite'),
      driver: sqlite3.Database
    });
    // Enable foreign keys
    await db.run('PRAGMA foreign_keys = ON');
  }
  return db;
}

export async function query(sql: string, values: any[] = []) {
  try {
    const database = await getDb();
    
    // Determine if it's a mutation query (INSERT, UPDATE, DELETE, CREATE, ALTER, DROP)
    const isMutation = /^\s*(INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i.test(sql);
    
    if (isMutation) {
      const result = await database.run(sql, values);
      // Mock mysql2 ResultSetHeader to ensure compatibility with existing code
      return {
        insertId: result.lastID,
        affectedRows: result.changes,
      };
    } else {
      const rows = await database.all(sql, values);
      return rows;
    }
  } catch (error) {
    console.error('Database Error: ', error);
    throw error;
  }
}
