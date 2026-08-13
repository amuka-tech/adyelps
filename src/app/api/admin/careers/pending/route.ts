import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*, users!inner(first_name, last_name, email)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });
      
    if (error) throw error;

    // Flatten the user data if needed to match previous response
    const formattedJobs = jobs.map((job: any) => ({
      ...job,
      first_name: job.users?.first_name,
      last_name: job.users?.last_name,
      email: job.users?.email,
      users: undefined
    }));

    return NextResponse.json({ jobs: formattedJobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
