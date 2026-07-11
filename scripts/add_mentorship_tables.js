const mysql = require('mysql2/promise');

async function addMentorshipTables() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb',
  });

  try {
    console.log("Creating mentor_profiles table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mentor_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        industry VARCHAR(100) NOT NULL,
        bio TEXT,
        skills JSON,
        is_accepting_mentees BOOLEAN DEFAULT TRUE,
        max_mentees INT DEFAULT 3,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log("Creating mentorships table...");
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS mentorships (
        id INT AUTO_INCREMENT PRIMARY KEY,
        mentor_id INT NOT NULL,
        mentee_id INT NOT NULL,
        status ENUM('PENDING', 'ACTIVE', 'COMPLETED', 'DECLINED') DEFAULT 'PENDING',
        goals TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (mentee_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Insert a mock mentor profile for testing (assuming we have users)
    console.log("Inserting a mock mentor profile...");
    const [users] = await connection.execute("SELECT id FROM users LIMIT 1");
    if (users.length > 0) {
      const userId = users[0].id;
      // Check if profile exists
      const [profiles] = await connection.execute("SELECT id FROM mentor_profiles WHERE user_id = ?", [userId]);
      if (profiles.length === 0) {
        await connection.execute(
          "INSERT INTO mentor_profiles (user_id, industry, bio, skills, is_accepting_mentees, max_mentees) VALUES (?, ?, ?, ?, ?, ?)",
          [userId, 'Technology', 'Senior Software Engineer with 10 years of experience. Passionate about helping others.', JSON.stringify(['React', 'Node.js', 'System Design']), true, 5]
        );
      }
    }

    console.log("Successfully created mentorship tables!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await connection.end();
  }
}

addMentorshipTables();
