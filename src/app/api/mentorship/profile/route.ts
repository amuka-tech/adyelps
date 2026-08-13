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

    const { data: profiles, error: profilesError } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', user.id);
    
    if (profilesError) throw profilesError;
    
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ profile: null });
    }

    const profile = profiles[0];
    profile.skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills;
    
    return NextResponse.json({ profile });

  } catch (error: any) {
    console.error("Mentor Profile GET Error:", error);
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

    const body = await request.json();
    const { industry, bio, skills, is_accepting_mentees, max_mentees } = body;

    const { data: existing } = await supabase
      .from('mentor_profiles')
      .select('id')
      .eq('user_id', user.id);

    if (existing && existing.length > 0) {
      // Update
      const { error: updateError } = await supabase
        .from('mentor_profiles')
        .update({
          industry,
          bio,
          skills: JSON.stringify(skills),
          is_accepting_mentees: is_accepting_mentees ? true : false,
          max_mentees
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
    } else {
      // Insert
      const { error: insertError } = await supabase
        .from('mentor_profiles')
        .insert([{
          user_id: user.id,
          industry,
          bio,
          skills: JSON.stringify(skills),
          is_accepting_mentees: is_accepting_mentees ? true : false,
          max_mentees
        }]);
      
      if (insertError) throw insertError;
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Mentor Profile POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
