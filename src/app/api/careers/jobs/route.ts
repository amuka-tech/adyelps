import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const jobType = searchParams.get('job_type');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let query = supabase
      .from('jobs')
      .select(`
        *,
        users (
          first_name,
          last_name
        )
      `)
      .eq('status', 'ACTIVE')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (industry) {
      query = query.eq('industry', industry);
    }
    if (location) {
      query = query.ilike('location', `%${location}%`);
    }
    if (jobType) {
      query = query.eq('job_type', jobType);
    }

    const { data: jobs, error } = await query;
    if (error) throw error;

    const formattedJobs = jobs?.map((j: any) => ({
      ...j,
      first_name: j.users?.first_name,
      last_name: j.users?.last_name
    })) || [];

    return NextResponse.json({ jobs: formattedJobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, company, industry, location, job_type, description, requirements, application_link, offers_referral } = body;

    // Basic validation
    if (!title || !company || !industry || !location || !job_type || !description || !requirements) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        posted_by_id: user.id,
        title,
        company,
        industry,
        location,
        job_type,
        description,
        requirements,
        application_link: application_link || null,
        offers_referral: offers_referral ? 1 : 0
      })
      .select('id')
      .single();
      
    if (error) throw error;

    return NextResponse.json({ message: 'Job submitted for review', id: data.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
