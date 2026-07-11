import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Fetch all mentorship requests for the current user
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const currentUser: any = await verifyToken(token);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const requests: any = await query(`
      SELECT 
        m.id, m.status, m.goals, m.created_at,
        mentor.id as mentor_id, mentor.first_name as mentor_first_name, mentor.last_name as mentor_last_name, mentor.profession as mentor_profession,
        mentee.id as mentee_id, mentee.first_name as mentee_first_name, mentee.last_name as mentee_last_name, mentee.profession as mentee_profession
      FROM mentorships m
      JOIN users mentor ON m.mentor_id = mentor.id
      JOIN users mentee ON m.mentee_id = mentee.id
      WHERE m.mentor_id = ? OR m.mentee_id = ?
      ORDER BY m.created_at DESC
    `, [currentUser.id, currentUser.id]);

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Mentorship Requests GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new mentorship request
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const currentUser: any = await verifyToken(token);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { mentor_id, goals } = body;

    if (mentor_id === currentUser.id) {
      return NextResponse.json({ error: 'You cannot mentor yourself' }, { status: 400 });
    }

    // Check if a request already exists
    const existing: any = await query(`
      SELECT id FROM mentorships WHERE mentor_id = ? AND mentee_id = ? AND status IN ('PENDING', 'ACTIVE')
    `, [mentor_id, currentUser.id]);

    if (existing.length > 0) {
      return NextResponse.json({ error: 'An active or pending request already exists.' }, { status: 400 });
    }

    await query(`
      INSERT INTO mentorships (mentor_id, mentee_id, goals) VALUES (?, ?, ?)
    `, [mentor_id, currentUser.id, goals]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Mentorship Requests POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Accept or Decline a mentorship request
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const currentUser: any = await verifyToken(token);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { request_id, status } = body; // status can be ACTIVE or DECLINED

    // Ensure the current user is the mentor for this request
    const existing: any = await query(`
      SELECT id FROM mentorships WHERE id = ? AND mentor_id = ?
    `, [request_id, currentUser.id]);

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Unauthorized or request not found' }, { status: 403 });
    }

    await query(`
      UPDATE mentorships SET status = ? WHERE id = ?
    `, [status, request_id]);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Mentorship Requests PUT Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
