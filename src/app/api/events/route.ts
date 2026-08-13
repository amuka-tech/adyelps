import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: events, error } = await supabase
      .from('events')
      .select('*, organizer:users(first_name, last_name)')
      .order('event_date', { ascending: true });

    if (error) throw error;

    const formattedEvents = events?.map((e: any) => ({
      ...e,
      organizer_first: e.organizer?.first_name,
      organizer_last: e.organizer?.last_name
    })) || [];

    return NextResponse.json({ events: formattedEvents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    const role = userData?.role;
    
    if (!role || (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'PRO')) {
      return NextResponse.json({ error: 'Forbidden: Requires PRO or Admin role' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, event_date, location, image_url } = body;

    if (!title || !description || !event_date || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: insertResult, error } = await supabase
      .from('events')
      .insert({
        title,
        description,
        event_date,
        location,
        image_url: image_url || null,
        created_by_id: user.id
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Event created successfully', id: insertResult.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
