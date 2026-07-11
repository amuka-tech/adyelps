import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { logAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, password, classYear, profession, phone } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await query('SELECT * FROM users WHERE email = ?', [email]) as any[];
    if (existingUsers.length > 0) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user into database
    const insertQuery = `
      INSERT INTO users (first_name, last_name, email, password, class_year, profession, phone, account_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING')
    `;
    
    const insertRes: any = await query(insertQuery, [firstName, lastName, email, hashedPassword, classYear || null, profession || null, phone || null]);
    const userId = insertRes.insertId;

    await logAction(userId, 'USER_REGISTER', `New user registered: ${firstName} ${lastName} (${email})`);

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
