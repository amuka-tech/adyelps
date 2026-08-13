import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const pollId = params.id;

    const body = await request.json();
    const { poll_option_id } = body;

    if (!poll_option_id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 });
    }

    // Check if poll is active
    const { data: pollResult, error: pollError } = await supabase
      .from('polls')
      .select('status')
      .eq('id', pollId);

    if (pollError || !pollResult || pollResult.length === 0) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }
    if (pollResult[0].status !== 'ACTIVE') {
      return NextResponse.json({ error: 'This poll is no longer active' }, { status: 400 });
    }

    // Insert vote. If the user already voted for this poll, the UNIQUE KEY (poll_id, user_id) will throw a duplicate key error
    const { error: insertError } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        user_id: user.id,
        poll_option_id: poll_option_id
      });
      
    if (insertError) {
      if (insertError.code === '23505' || insertError.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'You have already voted in this poll. One member, one vote.' }, { status: 400 });
      }
      throw insertError;
    }

    return NextResponse.json({ message: 'Vote successfully cast' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
