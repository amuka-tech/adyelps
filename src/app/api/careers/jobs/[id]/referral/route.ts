import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const jobId = params.id;
    
    const body = await request.json();
    const { message } = body;

    // Check if job exists and has a poster
    const jobs: any = await query(`SELECT posted_by_id, offers_referral FROM jobs WHERE id = ?`, [jobId]);
    if (jobs.length === 0) {
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
    await query(
      `INSERT INTO referral_requests (job_id, requester_id, poster_id, message) VALUES (?, ?, ?, ?)`,
      [jobId, user.id, job.posted_by_id, message || null]
    );

    // Simulate Notification Logging
    console.log(`[SYSTEM NOTIFICATION]: User ${user.id} requested a referral from User ${job.posted_by_id} for Job ID ${jobId}`);

    return NextResponse.json({ message: 'Referral request sent successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
