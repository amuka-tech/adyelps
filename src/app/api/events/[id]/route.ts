import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const eventId = params.id;

    const eventResult: any = await query(`
      SELECT e.*, u.first_name as organizer_first, u.last_name as organizer_last
      FROM events e
      JOIN users u ON e.created_by_id = u.id
      WHERE e.id = ?
    `, [eventId]);

    if (!eventResult || eventResult.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = eventResult[0];

    const tiers = await query(`
      SELECT * FROM event_ticket_tiers WHERE event_id = ?
    `, [eventId]);

    return NextResponse.json({ event, tiers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
