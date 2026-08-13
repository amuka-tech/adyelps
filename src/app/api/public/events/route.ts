import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const events = await query(`
      SELECT e.id, e.title, e.description, e.event_date, e.location, e.image_url 
      FROM events e
      WHERE e.event_date >= date('now')
      ORDER BY e.event_date ASC
    `);
    
    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
