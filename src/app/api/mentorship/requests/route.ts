import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Fetch all mentorship requests for the current user
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: requests, error: requestsError } = await supabase
      .from('mentorships')
      .select('*')
      .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (requestsError) throw requestsError;

    const { data: users } = await supabase
      .from('users')
      .select('id, first_name, last_name, profession');

    const usersMap: any = {};
    if (users) {
      users.forEach((u: any) => {
        usersMap[u.id] = u;
      });
    }

    const formattedRequests = requests?.map((r: any) => {
      const mentor = usersMap[r.mentor_id] || {};
      const mentee = usersMap[r.mentee_id] || {};
      
      return {
        id: r.id,
        status: r.status,
        goals: r.goals,
        created_at: r.created_at,
        mentor_id: mentor.id,
        mentor_first_name: mentor.first_name,
        mentor_last_name: mentor.last_name,
        mentor_profession: mentor.profession,
        mentee_id: mentee.id,
        mentee_first_name: mentee.first_name,
        mentee_last_name: mentee.last_name,
        mentee_profession: mentee.profession
      };
    }) || [];

    return NextResponse.json({ requests: formattedRequests });

  } catch (error: any) {
    console.error("Mentorship Requests GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new mentorship request
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mentor_id, goals } = body;

    if (mentor_id === user.id) {
      return NextResponse.json({ error: 'You cannot mentor yourself' }, { status: 400 });
    }

    // Check if a request already exists
    const { data: existing, error: existingError } = await supabase
      .from('mentorships')
      .select('id')
      .eq('mentor_id', mentor_id)
      .eq('mentee_id', user.id)
      .in('status', ['PENDING', 'ACTIVE']);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return NextResponse.json({ error: 'An active or pending request already exists.' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('mentorships')
      .insert([{
        mentor_id,
        mentee_id: user.id,
        goals
      }]);
    
    if (insertError) throw insertError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Mentorship Requests POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Accept or Decline a mentorship request
export async function PUT(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { request_id, status } = body; // status can be ACTIVE or DECLINED

    // Ensure the current user is the mentor for this request
    const { data: existing, error: existingError } = await supabase
      .from('mentorships')
      .select('id')
      .eq('id', request_id)
      .eq('mentor_id', user.id);

    if (existingError) throw existingError;

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: 'Unauthorized or request not found' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('mentorships')
      .update({ status })
      .eq('id', request_id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Mentorship Requests PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
