import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        class_year VARCHAR(10),
        profession VARCHAR(100),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(createUsersTableQuery);

    // Try to add role column. Catch error if it already exists (ER_DUP_FIELDNAME)
    try {
      await query(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'MEMBER';`);
    } catch (err: any) {
      if (!(err.message && err.message.includes('duplicate column name'))) {
        throw err;
      }
    }

    const createObituariesTable = `
      CREATE TABLE IF NOT EXISTS obituaries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        deceased_name VARCHAR(255) NOT NULL,
        biography TEXT,
        photo_url VARCHAR(255),
        funeral_dates_venues TEXT,
        spokesperson_contact VARCHAR(255),
        target_amount DECIMAL(15,2),
        contribution_expiry DATETIME,
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(createObituariesTable);

    const createDeductionRatesTable = `
      CREATE TABLE IF NOT EXISTS deduction_rates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(100) NOT NULL,
        rate_type TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await query(createDeductionRatesTable);

    const createContributionsTable = `
      CREATE TABLE IF NOT EXISTS contributions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        obituary_id INT NOT NULL,
        user_id INT NOT NULL,
        amount_gross DECIMAL(15,2) NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        verified_by_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (obituary_id) REFERENCES obituaries(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (verified_by_id) REFERENCES users(id)
      );
    `;
    await query(createContributionsTable);

    const createDisbursementsTable = `
      CREATE TABLE IF NOT EXISTS disbursements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        obituary_id INT NOT NULL,
        amount_net DECIMAL(15,2) NOT NULL,
        proof_url VARCHAR(255) NOT NULL,
        disbursed_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (obituary_id) REFERENCES obituaries(id),
        FOREIGN KEY (disbursed_by_id) REFERENCES users(id)
      );
    `;
    await query(createDisbursementsTable);

    const createCondolencesTable = `
      CREATE TABLE IF NOT EXISTS condolences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        obituary_id INT NOT NULL,
        user_id INT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (obituary_id) REFERENCES obituaries(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;
    await query(createCondolencesTable);

    // Insert some default deduction rates if table is empty
    const checkRates = await query(`SELECT COUNT(*) as count FROM deduction_rates`);
    const count = (checkRates as any[])[0].count;
    if (count === 0) {
      await query(`
        INSERT INTO deduction_rates (name, rate_type, amount) VALUES 
        ('Mobile Money Tax', 'PERCENTAGE', 1.00),
        ('Bank Withdrawal Fee', 'FIXED', 2500.00),
        ('Platform Maintenance', 'PERCENTAGE', 2.00)
      `);
    }

    const createJobsTable = `
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        posted_by_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        industry VARCHAR(100) NOT NULL,
        location VARCHAR(255) NOT NULL,
        job_type TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        application_link VARCHAR(255),
        offers_referral BOOLEAN DEFAULT FALSE,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (posted_by_id) REFERENCES users(id)
      );
    `;
    await query(createJobsTable);

    const createReferralRequestsTable = `
      CREATE TABLE IF NOT EXISTS referral_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INT NOT NULL,
        requester_id INT NOT NULL,
        poster_id INT NOT NULL,
        message TEXT,
        status TEXT DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (requester_id) REFERENCES users(id),
        FOREIGN KEY (poster_id) REFERENCES users(id)
      );
    `;
    await query(createReferralRequestsTable);

    await query(`
      CREATE TABLE IF NOT EXISTS businesses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id INT NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        location VARCHAR(255) NOT NULL,
        website_url VARCHAR(255),
        whatsapp_number VARCHAR(50) NOT NULL,
        offers_alumni_discount BOOLEAN DEFAULT FALSE,
        discount_details VARCHAR(255),
        status TEXT DEFAULT 'PENDING',
        is_featured BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        event_date DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        image_url VARCHAR(255),
        status TEXT DEFAULT 'UPCOMING',
        created_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS ticket_tiers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        capacity INT NOT NULL,
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        ticket_tier_id INT NOT NULL,
        dietary_requirements VARCHAR(255),
        special_requirements VARCHAR(255),
        status TEXT DEFAULT 'PAID',
        qr_token VARCHAR(255) UNIQUE NOT NULL,
        is_checked_in BOOLEAN DEFAULT FALSE,
        check_in_time DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (event_id) REFERENCES events(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (ticket_tier_id) REFERENCES ticket_tiers(id)
      )
    `);

    try {
      await query(`ALTER TABLE users ADD COLUMN hide_contact_info BOOLEAN DEFAULT FALSE;`);
    } catch (err: any) {
      if (!(err.message && err.message.includes('duplicate column name'))) {
        throw err;
      }
    }

    await query(`
      CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        poll_type TEXT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status TEXT DEFAULT 'ACTIVE',
        created_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS poll_options (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INT NOT NULL,
        option_text VARCHAR(255) NOT NULL,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS poll_votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        poll_id INT NOT NULL,
        user_id INT NOT NULL,
        poll_option_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (poll_option_id) REFERENCES poll_options(id),
        UNIQUE (poll_id, user_id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        doc_type TEXT NOT NULL,
        file_url VARCHAR(255) NOT NULL,
        uploaded_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        goal_amount DECIMAL(15,2) NOT NULL,
        raised_amount DECIMAL(15,2) DEFAULT 0.00,
        image_url VARCHAR(255),
        deadline DATETIME,
        status TEXT DEFAULT 'ACTIVE',
        created_by_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS project_donations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INT NOT NULL,
        user_id INT NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        is_anonymous BOOLEAN DEFAULT FALSE,
        payment_status TEXT DEFAULT 'COMPLETED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT NOT NULL,
        image_url VARCHAR(255),
        category VARCHAR(100) NOT NULL,
        status TEXT DEFAULT 'DRAFT',
        author_id INT NOT NULL,
        published_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS project_updates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS shop_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INT NOT NULL DEFAULT 0,
        image_url VARCHAR(255),
        status TEXT DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS shop_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INT NOT NULL,
        total_amount DECIMAL(15,2) NOT NULL,
        status TEXT DEFAULT 'PENDING',
        shipping_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS shop_order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        price_at_purchase DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES shop_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES shop_products(id)
      )
    `);

    return NextResponse.json({ message: 'All tables initialized successfully' });
  } catch (error: any) {
    console.error("DB Init Error: ", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
