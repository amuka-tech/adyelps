import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    // Ensure the user is logged in
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const location = searchParams.get('location');
    const jobType = searchParams.get('job_type');

    let sql = `
      SELECT j.*, u.first_name, u.last_name 
      FROM jobs j
      JOIN users u ON j.posted_by_id = u.id
      WHERE j.status = 'ACTIVE' 
      AND j.created_at >= datetime('now', '-30 days')
    `;
    const params: any[] = [];

    if (industry) {
      sql += ` AND j.industry = ?`;
      params.push(industry);
    }
    if (location) {
      sql += ` AND j.location LIKE ?`;
      params.push(`%${location}%`);
    }
    if (jobType) {
      sql += ` AND j.job_type = ?`;
      params.push(jobType);
    }

    sql += ` ORDER BY j.created_at DESC`;
    
    const jobs = await query(sql, params);
    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, company, industry, location, job_type, description, requirements, application_link, offers_referral } = body;

    // Basic validation
    if (!title || !company || !industry || !location || !job_type || !description || !requirements) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertResult: any = await query(
      `INSERT INTO jobs (posted_by_id, title, company, industry, location, job_type, description, requirements, application_link, offers_referral) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user.id, title, company, industry, location, job_type, description, requirements, application_link || null, offers_referral ? 1 : 0]
    );

    return NextResponse.json({ message: 'Job submitted for review', id: insertResult.insertId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
