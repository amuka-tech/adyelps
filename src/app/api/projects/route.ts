import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as any;
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const projects = await query(`
      SELECT p.*, u.first_name, u.last_name 
      FROM projects p
      JOIN users u ON p.created_by_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserFromCookie();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { title, description, goal_amount, image_url, deadline } = await request.json();

    if (!title || !description || !goal_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertResult: any = await query(
      `INSERT INTO projects (title, description, goal_amount, image_url, deadline, created_by_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, goal_amount, image_url || null, deadline || null, user.id]
    );

    return NextResponse.json({ message: 'Project created successfully', projectId: insertResult.insertId });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
