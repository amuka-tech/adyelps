import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const eventId = params.id;

    const body = await request.json();
    const { ticket_tier_id, dietary_requirements, special_requirements } = body;

    if (!ticket_tier_id) {
      return NextResponse.json({ error: 'Missing ticket tier' }, { status: 400 });
    }

    const { data: tier, error: tierError } = await supabase
      .from('event_ticket_tiers')
      .select('capacity')
      .eq('id', ticket_tier_id)
      .eq('event_id', eventId)
      .single();

    if (tierError || !tier) {
      return NextResponse.json({ error: 'Invalid ticket tier' }, { status: 400 });
    }

    const { count, error: countError } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('ticket_tier_id', ticket_tier_id);

    if (countError) throw countError;

    if ((count || 0) >= tier.capacity) {
      return NextResponse.json({ error: 'Ticket tier is sold out' }, { status: 400 });
    }

    const qrToken = crypto.randomUUID();

    const { error: insertError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: user.id,
        ticket_tier_id,
        dietary_requirements: dietary_requirements || null,
        special_requirements: special_requirements || null,
        status: 'PAID',
        qr_token: qrToken
      });

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Ticket purchased successfully', qr_token: qrToken }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
