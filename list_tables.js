const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function run() {
  const db = await open({ filename: 'database.sqlite', driver: sqlite3.Database });
  const tables = await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log("Tables:");
  console.log(tables.map(t => t.name).join('\n'));
}

run().catch(console.error);
