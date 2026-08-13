import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: currentUserProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    const currentUser = currentUserProfile || {};

    const { data: mentors, error: mentorsError } = await supabase
      .from('mentor_profiles')
      .select(`
        id, industry, bio, skills, is_accepting_mentees, max_mentees, user_id,
        users (id, first_name, last_name, profession)
      `)
      .eq('is_accepting_mentees', true)
      .neq('user_id', user.id);

    if (mentorsError) throw mentorsError;

    const formattedMentors = mentors?.map((m: any) => {
      let score = 0;
      if (m.industry === currentUser.industry) {
        score += 50;
      }
      return {
        profile_id: m.id,
        industry: m.industry,
        bio: m.bio,
        skills: typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills,
        is_accepting_mentees: m.is_accepting_mentees,
        max_mentees: m.max_mentees,
        user_id: m.users?.id,
        first_name: m.users?.first_name,
        last_name: m.users?.last_name,
        profession: m.users?.profession,
        matchScore: score
      };
    }).sort((a: any, b: any) => b.matchScore - a.matchScore) || [];

    return NextResponse.json({ mentors: formattedMentors });

  } catch (error: any) {
    console.error("Mentors Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
