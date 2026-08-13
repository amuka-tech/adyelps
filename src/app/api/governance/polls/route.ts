import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());

    // Fetch polls and their options
    const { data: pollsResult, error: pollsError } = await supabase
      .from('polls')
      .select(`
        *,
        users (first_name, last_name)
      `)
      .order('start_date', { ascending: false });

    if (pollsError) throw pollsError;

    const formattedPolls = [];
    
    for (let poll of (pollsResult || [])) {
      // Fetch options and tally votes
      const { data: optionsResult, error: optionsError } = await supabase
        .from('poll_options')
        .select(`
          id,
          option_text,
          poll_votes (id)
        `)
        .eq('poll_id', poll.id);

      if (optionsError) throw optionsError;

      const options = (optionsResult || []).map((opt: any) => ({
        id: opt.id,
        option_text: opt.option_text,
        vote_count: opt.poll_votes ? opt.poll_votes.length : 0
      }));

      formattedPolls.push({
        ...poll,
        first_name: (poll as any).users?.first_name,
        last_name: (poll as any).users?.last_name,
        options,
        total_votes: options.reduce((sum: number, opt: any) => sum + opt.vote_count, 0)
      });
    }

    return NextResponse.json({ polls: formattedPolls });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
