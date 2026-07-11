const mysql = require('mysql2/promise');

async function migrate() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    console.log("Starting RBAC Migration...");

    // 1. Create Tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INT NOT NULL,
        role_id INT NOT NULL,
        PRIMARY KEY (user_id, role_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NULL,
        action VARCHAR(255) NOT NULL,
        description TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS system_settings (
        setting_key VARCHAR(100) PRIMARY KEY,
        setting_value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Add account status if not exists
    try {
      await connection.execute(`ALTER TABLE users ADD COLUMN account_status ENUM('ACTIVE', 'SUSPENDED', 'BANNED') DEFAULT 'ACTIVE'`);
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME') throw err;
    }

    console.log("Tables created successfully.");

    // 2. Seed Default Roles
    const defaultRoles = [
      'Super Admin', 'General Admin', 'Treasurer', 'PRO', 'Career Manager', 'Member'
    ];
    for (const role of defaultRoles) {
      await connection.execute(`INSERT IGNORE INTO roles (name) VALUES (?)`, [role]);
    }

    // 3. Seed Permissions
    const defaultPermissions = [
      'users.manage', 'welfare.moderate', 'careers.moderate', 
      'marketplace.moderate', 'events.moderate', 'governance.moderate', 
      'system.manage', 'news.manage', 'projects.manage'
    ];
    for (const perm of defaultPermissions) {
      await connection.execute(`INSERT IGNORE INTO permissions (name) VALUES (?)`, [perm]);
    }

    console.log("Seeded Roles & Permissions.");

    // 4. Map Permissions to Roles (Basic setup)
    // First, fetch all IDs
    const [roles] = await connection.execute('SELECT * FROM roles');
    const [perms] = await connection.execute('SELECT * FROM permissions');
    
    const roleMap = {}; roles.forEach(r => roleMap[r.name] = r.id);
    const permMap = {}; perms.forEach(p => permMap[p.name] = p.id);

    const assignPerms = async (roleName, permNames) => {
      const roleId = roleMap[roleName];
      for (const permName of permNames) {
        const permId = permMap[permName];
        if (roleId && permId) {
          await connection.execute(`INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [roleId, permId]);
        }
      }
    };

    await assignPerms('Super Admin', defaultPermissions); // Super Admin gets everything
    await assignPerms('General Admin', ['welfare.moderate', 'careers.moderate', 'marketplace.moderate', 'events.moderate', 'governance.moderate', 'news.manage', 'projects.manage']);
    await assignPerms('Treasurer', ['welfare.moderate']);
    await assignPerms('PRO', ['news.manage', 'events.moderate']);
    await assignPerms('Career Manager', ['careers.moderate']);

    console.log("Mapped Permissions to Roles.");

    // 5. Migrate Existing Users
    // This will read users.role and map it to user_roles
    const [users] = await connection.execute('SELECT id, role FROM users');
    for (const user of users) {
      let targetRole = 'Member';
      if (user.role === 'SUPER_ADMIN') targetRole = 'Super Admin';
      else if (user.role === 'ADMIN') targetRole = 'General Admin';
      else if (user.role === 'TREASURER') targetRole = 'Treasurer';

      const roleId = roleMap[targetRole];
      if (roleId) {
        await connection.execute(`INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)`, [user.id, roleId]);
      }
    }

    console.log("Migrated user roles successfully.");

  } catch (err) {
    console.error("Migration Error:", err);
  } finally {
    await connection.end();
  }
}

migrate();
