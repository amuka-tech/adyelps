const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({host:'localhost', user:'root', database:'adyeldb'});
  
  // Find the SA ID
  const [users] = await c.query("SELECT id FROM users WHERE email='superadmin@adyel.com'");
  if (users.length === 0) {
    console.log("No superadmin found");
    process.exit(0);
  }
  const saId = users[0].id;
  
  // Find another user ID to inherit records (e.g., Obuku Emma)
  const [otherUsers] = await c.query("SELECT id FROM users WHERE email='obemma2016@gmail.com'");
  const heirId = otherUsers[0].id;

  // Reassign all foreign keys
  const tables = [
    { table: 'businesses', col: 'owner_id' },
    { table: 'jobs', col: 'posted_by_id' },
    { table: 'condolences', col: 'user_id' },
    { table: 'contributions', col: 'user_id' },
    { table: 'shop_orders', col: 'user_id' },
    { table: 'audit_logs', col: 'user_id' },
    { table: 'project_donations', col: 'user_id' },
    { table: 'projects', col: 'created_by_id' },
    { table: 'news_articles', col: 'author_id' },
    { table: 'polls', col: 'created_by_id' },
    { table: 'user_polls', col: 'user_id' },
    { table: 'documents', col: 'uploaded_by_id' },
    { table: 'user_roles', col: 'user_id' },
    { table: 'obituaries', col: 'created_by_id' }
  ];

  for (const t of tables) {
    try {
      await c.query(`UPDATE ${t.table} SET ${t.col} = ? WHERE ${t.col} = ?`, [heirId, saId]);
    } catch (err) {
      // ignore missing tables
    }
  }

  // Delete SA
  const [res] = await c.query("DELETE FROM users WHERE id=?", [saId]);
  console.log("Deleted SA:", res);
  
  await c.end();
}
run().catch(console.error);
