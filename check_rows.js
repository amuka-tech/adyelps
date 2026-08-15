const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  let totalRows = 0;
  for (const table of tables) {
    const rows = await db.all(`SELECT count(*) as count FROM ${table.name}`);
    if (rows[0].count > 0) {
      console.log(`Table ${table.name} has ${rows[0].count} rows.`);
      totalRows += rows[0].count;
    }
  }
  console.log(`Total rows in all tables: ${totalRows}`);
}
run().catch(console.error);
