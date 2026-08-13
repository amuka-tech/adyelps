import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tickets = await query(`
      SELECT r.*, e.title, e.event_date, e.location, t.name as tier_name, t.price
      FROM event_registrations r
      JOIN events e ON r.event_id = e.id
      JOIN event_ticket_tiers t ON r.ticket_tier_id = t.id
      WHERE r.user_id = ?
      ORDER BY e.event_date DESC
    `, [user.id]);

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
