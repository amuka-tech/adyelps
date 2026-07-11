import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    console.log("Setting up event tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_ticket_tiers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        capacity INT DEFAULT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        tier_id INT NOT NULL,
        user_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        total_paid DECIMAL(10,2) NOT NULL,
        status ENUM('PAID', 'CANCELLED', 'REFUNDED') DEFAULT 'PAID',
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (tier_id) REFERENCES event_ticket_tiers(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Let's seed a ticket tier for the existing events if they don't have one
    const [events] = await pool.query('SELECT id FROM events');
    for (const event of events) {
      const [tiers] = await pool.query('SELECT id FROM event_ticket_tiers WHERE event_id = ?', [event.id]);
      if (tiers.length === 0) {
        await pool.query('INSERT INTO event_ticket_tiers (event_id, name, price, capacity) VALUES (?, ?, ?, ?), (?, ?, ?, ?)', [
          event.id, 'Standard Ticket', 50000, 200,
          event.id, 'VIP Ticket', 100000, 50
        ]);
      }
    }

    console.log("Event tables setup complete.");
  } catch (error) {
    console.error("Error setting up event tables:", error);
  } finally {
    await pool.end();
  }
}

main();
