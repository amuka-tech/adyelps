import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, poll_type, start_date, end_date, options } = body;

    if (!title || !description || !poll_type || !start_date || !end_date || !options || options.length < 2) {
      return NextResponse.json({ error: 'Missing required fields or insufficient options' }, { status: 400 });
    }

    // Insert Poll
    const insertPoll: any = await query(
      `INSERT INTO polls (title, description, poll_type, start_date, end_date, created_by_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, poll_type, start_date, end_date, user.id]
    );

    const pollId = insertPoll.insertId;

    // Insert Options
    for (const opt of options) {
      if (opt.trim()) {
        await query(
          `INSERT INTO poll_options (poll_id, option_text) VALUES (?, ?)`,
          [pollId, opt.trim()]
        );
      }
    }

    return NextResponse.json({ message: 'Poll created successfully', id: pollId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
