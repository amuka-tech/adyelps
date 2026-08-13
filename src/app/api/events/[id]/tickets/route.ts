import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const eventId = params.id;

    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier_id, quantity } = await request.json();

    if (!tier_id || !quantity || quantity < 1) {
      return NextResponse.json({ error: 'Invalid ticket selection' }, { status: 400 });
    }

    const { data: tier, error: tierError } = await supabase
      .from('event_ticket_tiers')
      .select('price, capacity')
      .eq('id', tier_id)
      .eq('event_id', eventId)
      .single();

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 });
    }

    const totalPaid = tier.price * quantity;

    if (tier.capacity !== null) {
      const { data: tickets, error: ticketsError } = await supabase
        .from('event_tickets')
        .select('quantity')
        .eq('tier_id', tier_id)
        .eq('status', 'PAID');
        
      if (ticketsError) throw ticketsError;
      
      const sold = tickets.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
      
      if (sold + quantity > tier.capacity) {
        return NextResponse.json({ error: 'Not enough tickets available in this tier' }, { status: 400 });
      }
    }

    const { error: insertError } = await supabase
      .from('event_tickets')
      .insert({
        event_id: eventId,
        tier_id,
        user_id: user.id,
        quantity,
        total_paid: totalPaid,
        status: 'PAID'
      });

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Ticket purchased successfully' });
  } catch (error: any) {
    console.error("Ticket purchase error:", error);
    return NextResponse.json({ error: 'Failed to process ticket purchase' }, { status: 500 });
  }
}
