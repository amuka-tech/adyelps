const mysql = require('mysql2/promise');

async function run() {
  const c = await mysql.createConnection({host:'localhost', user:'root', database:'adyeldb'});
  
  // Demote in `users` table
  await c.query("UPDATE users SET role = 'MEMBER' WHERE email = 'obemma2016@gmail.com'");
  
  // Remove SUPER_ADMIN role from `user_roles`
  // Assuming role_id = 1 is SUPER_ADMIN
  await c.query("DELETE FROM user_roles WHERE user_id = 1 AND role_id = 1");
  
  // Ensure he has the Member role (role_id = 6)
  try {
    await c.query("INSERT INTO user_roles (user_id, role_id) VALUES (1, 6)");
  } catch(e) {
    // Ignore if already exists
  }

  console.log("Obuku Emmanuel demoted successfully");
  await c.end();
}
run().catch(console.error);
