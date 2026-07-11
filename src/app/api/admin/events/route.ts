import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, event_date, location, image_url, tiers } = body;

    if (!title || !description || !event_date || !location || !tiers || tiers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields or tiers' }, { status: 400 });
    }

    // Insert Event
    const insertEvent: any = await query(
      `INSERT INTO events (title, description, event_date, location, image_url, created_by_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, event_date, location, image_url || null, user.id]
    );

    const eventId = insertEvent.insertId;

    // Insert Tiers
    for (const tier of tiers) {
      await query(
        `INSERT INTO ticket_tiers (event_id, name, price, capacity) VALUES (?, ?, ?, ?)`,
        [eventId, tier.name, tier.price, tier.capacity]
      );
    }

    return NextResponse.json({ message: 'Event created successfully', id: eventId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
