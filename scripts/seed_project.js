const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    // Get an admin user
    const [users] = await connection.execute("SELECT id FROM users WHERE role = 'ADMIN' LIMIT 1");
    if (users.length === 0) {
      console.log("No admin found.");
      return;
    }
    const adminId = users[0].id;

    // Create a dummy project
    const [result] = await connection.execute(
      `INSERT INTO projects (title, description, goal_amount, raised_amount, image_url, created_by_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "P7 Classroom Roof Renovation",
        "The roof of the primary 7 classroom block is leaking heavily during the rainy season. This is severely impacting the candidates' ability to study. We need to replace the entire iron sheet structure before the national exams.",
        15000000.00, // 15M UGX
        2500000.00,  // 2.5M raised so far
        "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop",
        adminId
      ]
    );

    const projectId = result.insertId;

    // Get a couple of other users for donations
    const [otherUsers] = await connection.execute("SELECT id FROM users WHERE id != ? LIMIT 3", [adminId]);
    
    if (otherUsers.length > 0) {
      await connection.execute(
        `INSERT INTO project_donations (project_id, user_id, amount, is_anonymous, payment_status) VALUES (?, ?, ?, ?, ?)`,
        [projectId, otherUsers[0].id, 1000000.00, 0, 'COMPLETED']
      );
      
      if (otherUsers.length > 1) {
        await connection.execute(
          `INSERT INTO project_donations (project_id, user_id, amount, is_anonymous, payment_status) VALUES (?, ?, ?, ?, ?)`,
          [projectId, otherUsers[1].id, 1500000.00, 1, 'COMPLETED'] // Anonymous
        );
      }
    }

    console.log("Seeded dummy project successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

seed();
