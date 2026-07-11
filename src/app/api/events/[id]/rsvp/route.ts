import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const eventId = params.id;

    const body = await request.json();
    const { ticket_tier_id, dietary_requirements, special_requirements } = body;

    if (!ticket_tier_id) {
      return NextResponse.json({ error: 'Missing ticket tier' }, { status: 400 });
    }

    // Capacity Check
    const tierResult: any = await query(`SELECT capacity FROM ticket_tiers WHERE id = ? AND event_id = ?`, [ticket_tier_id, eventId]);
    if (!tierResult || tierResult.length === 0) {
      return NextResponse.json({ error: 'Invalid ticket tier' }, { status: 400 });
    }

    const tier = tierResult[0];

    const countResult: any = await query(`SELECT COUNT(*) as sold FROM event_registrations WHERE ticket_tier_id = ?`, [ticket_tier_id]);
    const sold = countResult[0].sold;

    if (sold >= tier.capacity) {
      return NextResponse.json({ error: 'Ticket tier is sold out' }, { status: 400 });
    }

    // Generate unique QR token
    const qrToken = crypto.randomUUID();

    // Insert Registration (Simulating instant PAID status)
    await query(
      `INSERT INTO event_registrations (event_id, user_id, ticket_tier_id, dietary_requirements, special_requirements, status, qr_token) 
       VALUES (?, ?, ?, ?, ?, 'PAID', ?)`,
      [eventId, user.id, ticket_tier_id, dietary_requirements || null, special_requirements || null, qrToken]
    );

    return NextResponse.json({ message: 'Ticket purchased successfully', qr_token: qrToken }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
