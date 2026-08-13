import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, poll_type, start_date, end_date, options } = body;

    if (!title || !description || !poll_type || !start_date || !end_date || !options || options.length < 2) {
      return NextResponse.json({ error: 'Missing required fields or insufficient options' }, { status: 400 });
    }

    // Insert Poll
    const { data: pollData, error: pollError } = await supabase.from('polls').insert([
      { title, description, poll_type, start_date, end_date, created_by_id: user.id }
    ]).select().single();

    if (pollError) throw pollError;
    const pollId = pollData.id;

    // Insert Options
    const optionsToInsert = options.filter((opt: string) => opt.trim()).map((opt: string) => ({
      poll_id: pollId,
      option_text: opt.trim()
    }));

    if (optionsToInsert.length > 0) {
      const { error: optionsError } = await supabase.from('poll_options').insert(optionsToInsert);
      if (optionsError) throw optionsError;
    }

    return NextResponse.json({ message: 'Poll created successfully', id: pollId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
