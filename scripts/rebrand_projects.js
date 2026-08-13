const mysql = require('mysql2/promise');

async function rebrand() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    const [users] = await connection.execute("SELECT id FROM users LIMIT 1");
    if (users.length === 0) {
      console.log("No user found.");
      return;
    }
    const adminId = users[0].id;

    // Delete existing dummy projects and their donations
    await connection.execute("DELETE FROM project_donations");
    await connection.execute("DELETE FROM projects");

    // Insert 3 flagship projects
    const projects = [
      {
        title: "Parents' Waiting Pavilion",
        description: "Construct a shaded pavilion within the school grounds to provide a resting area for parents, serve as a shelter for events, and symbolize the permanent imprint of the Class of 2016.",
        goal: 20000000.00,
        img: "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=2069&auto=format&fit=crop"
      },
      {
        title: "Sanitary Pads Support for Girls",
        description: "Roll out a sanitary pad support program to promote menstrual hygiene, reduce absenteeism, and boost confidence, helping the girl-child remain in school.",
        goal: 15000000.00,
        img: "https://images.unsplash.com/photo-1579227114347-15d08fc37cae?q=80&w=2070&auto=format&fit=crop"
      },
      {
        title: "Education Support for Needy Learners",
        description: "Empower learners through scholarships, scholastic materials (books, pens, uniforms), mentorship, and skill building to change lives.",
        goal: 25000000.00,
        img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=2070&auto=format&fit=crop"
      }
    ];

    for (const p of projects) {
      await connection.execute(
        `INSERT INTO projects (title, description, goal_amount, raised_amount, image_url, created_by_id) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [p.title, p.description, p.goal, 0, p.img, adminId]
      );
    }

    console.log("Rebranded flagship projects seeded successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}

rebrand();
