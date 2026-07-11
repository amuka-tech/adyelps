const mysql = require('mysql2/promise');

async function addNotificationPreferences() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    // We add notification_preferences to the users table
    // It will hold a JSON object. We set a default string to avoid NULLs in existing rows.
    await connection.execute(`
      ALTER TABLE users 
      ADD COLUMN notification_preferences JSON DEFAULT (JSON_OBJECT('email_enabled', true, 'sms_enabled', false, 'in_app_enabled', true, 'marketing_emails', false))
    `);
    
    console.log("Successfully added notification_preferences column to users table.");
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("Column notification_preferences already exists.");
    } else {
      console.error("Database error:", error);
    }
  } finally {
    process.exit(0);
  }
}

addNotificationPreferences();
