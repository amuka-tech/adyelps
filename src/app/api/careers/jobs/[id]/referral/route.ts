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
    const jobId = params.id;
    
    const body = await request.json();
    const { message } = body;

    // Check if job exists and has a poster
    const { data: jobs, error: jobError } = await supabase
      .from('jobs')
      .select('posted_by_id, offers_referral')
      .eq('id', jobId);

    if (jobError || !jobs || jobs.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = jobs[0];
    if (!job.offers_referral) {
      return NextResponse.json({ error: 'This job does not offer referrals' }, { status: 400 });
    }

    if (job.posted_by_id === user.id) {
      return NextResponse.json({ error: 'You cannot request a referral from yourself' }, { status: 400 });
    }

    // Insert referral request
    const { error: insertError } = await supabase
      .from('referral_requests')
      .insert({
        job_id: jobId,
        requester_id: user.id,
        poster_id: job.posted_by_id,
        message: message || null
      });

    if (insertError) {
      throw insertError;
    }

    // Simulate Notification Logging
    console.log(`[SYSTEM NOTIFICATION]: User ${user.id} requested a referral from User ${job.posted_by_id} for Job ID ${jobId}`);

    return NextResponse.json({ message: 'Referral request sent successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
