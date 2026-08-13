const mysql = require('mysql2/promise');

async function cleanData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    console.log('Disabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    console.log('Deleting dummy user activity...');
    const activityTables = [
      'condolences',
      'project_donations',
      'event_tickets',
      'shop_order_items',
      'shop_orders',
      'messages',
      'poll_votes',
      'contributions',
      'transactions',
      'audit_logs',
      'mentor_profiles',
      'mentorships',
      'referral_requests',
      'password_resets',
      'project_updates'
    ];

    for (const table of activityTables) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`Truncated ${table}`);
    }

    console.log('Keeping only 5 items for main entities...');
    const mainEntities = [
      { table: 'projects', orderCol: 'id' },
      { table: 'events', orderCol: 'id' },
      { table: 'shop_products', orderCol: 'id' },
      { table: 'news_articles', orderCol: 'id' },
      { table: 'obituaries', orderCol: 'id' },
      { table: 'polls', orderCol: 'id' }
    ];

    for (const entity of mainEntities) {
      // Find the IDs to keep (the first 5)
      const [rows] = await connection.query(`SELECT id FROM ${entity.table} ORDER BY ${entity.orderCol} DESC LIMIT 5`);
      
      if (rows.length > 0) {
        const idsToKeep = rows.map(r => r.id);
        const placeholders = idsToKeep.map(() => '?').join(',');
        
        const [result] = await connection.query(
          `DELETE FROM ${entity.table} WHERE id NOT IN (${placeholders})`,
          idsToKeep
        );
        console.log(`Deleted ${result.affectedRows} extra items from ${entity.table}`);
      } else {
        console.log(`Table ${entity.table} is empty or has <= 5 items.`);
      }
    }

    console.log('Enabling foreign key checks...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('Data cleanup completed successfully.');

  } catch (error) {
    console.error('Error cleaning data:', error);
  } finally {
    await connection.end();
  }
}

cleanData();
