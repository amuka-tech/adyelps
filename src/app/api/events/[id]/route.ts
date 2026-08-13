import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const eventId = params.id;
    const supabase = createClient(await cookies());

    const { data: eventResult, error: eventError } = await supabase
      .from('events')
      .select('*, organizer:users(first_name, last_name)')
      .eq('id', eventId)
      .single();

    if (eventError || !eventResult) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const event = {
      ...eventResult,
      organizer_first: eventResult.organizer?.first_name,
      organizer_last: eventResult.organizer?.last_name
    };

    const { data: tiers, error: tiersError } = await supabase
      .from('event_ticket_tiers')
      .select('*')
      .eq('event_id', eventId);

    if (tiersError) throw tiersError;

    return NextResponse.json({ event, tiers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
