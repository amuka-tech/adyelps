import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, event_date, location, image_url, tiers } = body;

    if (!title || !description || !event_date || !location || !tiers || tiers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields or tiers' }, { status: 400 });
    }

    // Insert Event
    const { data: eventData, error: eventError } = await supabase.from('events').insert({
      title,
      description,
      event_date,
      location,
      image_url: image_url || null,
      created_by_id: user.id
    }).select('id').single();

    if (eventError) throw eventError;
    const eventId = eventData.id;

    // Insert Tiers
    const tiersToInsert = tiers.map((tier: any) => ({
      event_id: eventId,
      name: tier.name,
      price: tier.price,
      capacity: tier.capacity
    }));
    
    const { error: tiersError } = await supabase.from('event_ticket_tiers').insert(tiersToInsert);
    if (tiersError) throw tiersError;

    return NextResponse.json({ message: 'Event created successfully', id: eventId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
