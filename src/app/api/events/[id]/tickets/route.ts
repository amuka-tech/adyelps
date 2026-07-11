import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const eventId = params.id;

    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier_id, quantity } = await request.json();

    if (!tier_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid ticket selection' }, { status: 400 });
    }

    // Get tier details to calculate price
    const tierResult: any = await query(`SELECT price, capacity FROM event_ticket_tiers WHERE id = ? AND event_id = ?`, [tier_id, eventId]);
    if (!tierResult || tierResult.length === 0) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 });
    }

    const tier = tierResult[0];
    const totalPaid = tier.price * quantity;

    // Optional: check capacity
    if (tier.capacity !== null) {
      const soldResult: any = await query(`SELECT SUM(quantity) as sold FROM event_tickets WHERE tier_id = ? AND status = 'PAID'`, [tier_id]);
      const sold = soldResult[0]?.sold || 0;
      if (sold + quantity > tier.capacity) {
        return NextResponse.json({ error: 'Not enough tickets available in this tier' }, { status: 400 });
      }
    }

    // Insert ticket
    await query(`
      INSERT INTO event_tickets (event_id, tier_id, user_id, quantity, total_paid, status)
      VALUES (?, ?, ?, ?, ?, 'PAID')
    `, [eventId, tier_id, user.id, quantity, totalPaid]);

    return NextResponse.json({ message: 'Ticket purchased successfully' });
  } catch (error: any) {
    console.error("Ticket purchase error:", error);
    return NextResponse.json({ error: 'Failed to process ticket purchase' }, { status: 500 });
  }
}
