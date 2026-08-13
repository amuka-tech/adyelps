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
      // In a real system, there might be an 'EVENT_STAFF' role, but we use ADMIN here
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { qr_token } = body;

    if (!qr_token) {
      return NextResponse.json({ error: 'Missing QR Token' }, { status: 400 });
    }

    // Find the ticket
    const ticketResult: any = await query(`
      SELECT r.*, u.first_name, u.last_name, t.name as tier_name
      FROM event_registrations r
      JOIN users u ON r.user_id = u.id
      JOIN event_ticket_tiers t ON r.ticket_tier_id = t.id
      WHERE r.qr_token = ?
    `, [qr_token]);

    if (!ticketResult || ticketResult.length === 0) {
      return NextResponse.json({ valid: false, message: 'Invalid ticket - Not found in system' }, { status: 404 });
    }

    const ticket = ticketResult[0];

    if (ticket.status !== 'PAID') {
       return NextResponse.json({ valid: false, message: `Ticket status is ${ticket.status}. Payment required.` }, { status: 400 });
    }

    if (ticket.is_checked_in) {
      return NextResponse.json({ 
        valid: false, 
        message: 'TICKET ALREADY SCANNED',
        details: `${ticket.first_name} ${ticket.last_name} (${ticket.tier_name})`,
        check_in_time: ticket.check_in_time
      }, { status: 400 });
    }

    // Valid ticket, let's check them in
    const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await query(`UPDATE event_registrations SET is_checked_in = TRUE, check_in_time = ? WHERE id = ?`, [currentTime, ticket.id]);

    return NextResponse.json({ 
      valid: true, 
      message: 'VALID - LTC Alumnus Verified',
      details: `${ticket.first_name} ${ticket.last_name} (${ticket.tier_name})`
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
