import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: regs, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        events ( title, event_date, location ),
        event_ticket_tiers ( name, price )
      `)
      .eq('user_id', user.id);

    if (error) throw error;

    const tickets = regs?.map((r: any) => ({
      ...r,
      title: r.events?.title,
      event_date: r.events?.event_date,
      location: r.events?.location,
      tier_name: r.event_ticket_tiers?.name,
      price: r.event_ticket_tiers?.price,
      events: undefined,
      event_ticket_tiers: undefined
    })).sort((a, b) => new Date(b.event_date || 0).getTime() - new Date(a.event_date || 0).getTime());

    return NextResponse.json({ tickets: tickets || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
