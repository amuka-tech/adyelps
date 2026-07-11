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
    const pollId = params.id;

    const body = await request.json();
    const { poll_option_id } = body;

    if (!poll_option_id) {
      return NextResponse.json({ error: 'Missing option ID' }, { status: 400 });
    }

    // Check if poll is active
    const pollResult: any = await query(`SELECT status FROM polls WHERE id = ?`, [pollId]);
    if (!pollResult || pollResult.length === 0) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }
    if (pollResult[0].status !== 'ACTIVE') {
      return NextResponse.json({ error: 'This poll is no longer active' }, { status: 400 });
    }

    // Insert vote. If the user already voted for this poll, the UNIQUE KEY (poll_id, user_id) will throw an ER_DUP_ENTRY error
    try {
      await query(
        `INSERT INTO poll_votes (poll_id, user_id, poll_option_id) VALUES (?, ?, ?)`,
        [pollId, user.id, poll_option_id]
      );
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY') {
        return NextResponse.json({ error: 'You have already voted in this poll. One member, one vote.' }, { status: 400 });
      }
      throw err;
    }

    return NextResponse.json({ message: 'Vote successfully cast' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
