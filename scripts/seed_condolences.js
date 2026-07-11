const mysql = require('mysql2/promise');

async function seedCondolences() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    const obituaries = [21, 22, 23, 24, 25];
    const users = [18, 8, 4];
    
    const messages = [
      "Our hearts go out to the family. May God grant them peace.",
      "A tremendous loss for our community. You will be missed.",
      "Rest in peace. Thank you for your incredible service to the school.",
      "My deepest condolences. We pray for strength for the family during this time.",
      "Sending love and prayers. A true legend of Adyel has departed."
    ];

    for (let i = 0; i < obituaries.length; i++) {
      const obitId = obituaries[i];
      // Add 2-3 condolences per obituary
      const numCondolences = Math.floor(Math.random() * 2) + 2; 

      for (let j = 0; j < numCondolences; j++) {
        const userId = users[Math.floor(Math.random() * users.length)];
        const message = messages[Math.floor(Math.random() * messages.length)];
        
        await connection.query(
          `INSERT INTO condolences (obituary_id, user_id, message, status) VALUES (?, ?, ?, 'APPROVED')`,
          [obitId, userId, message]
        );
      }
    }

    console.log('Successfully seeded random condolences!');

  } catch (error) {
    console.error('Error seeding condolences:', error);
  } finally {
    await connection.end();
  }
}

seedCondolences();
