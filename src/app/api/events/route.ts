import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const events = await query(`
      SELECT e.*, u.first_name as organizer_first, u.last_name as organizer_last
      FROM events e
      JOIN users u ON e.created_by_id = u.id
      ORDER BY e.event_date ASC
    `);

    // Only returning the events. For ticket tiers, fetch in the specific event details
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { cookies } = await import('next/headers');
    const { verifyToken } = await import('@/lib/auth');
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'PRO')) {
      return NextResponse.json({ error: 'Forbidden: Requires PRO or Admin role' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, event_date, location, image_url } = body;

    if (!title || !description || !event_date || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertResult: any = await query(
      `INSERT INTO events (title, description, event_date, location, image_url, created_by_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, location, image_url || null, user.id]
    );

    return NextResponse.json({ message: 'Event created successfully', id: insertResult.insertId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
