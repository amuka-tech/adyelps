import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || ((user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') && user.role !== 'TREASURER')) {
      return NextResponse.json({ error: 'Forbidden: Requires Admin or Treasurer role' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; // 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await query(
      `UPDATE contributions SET status = ?, verified_by_id = ? WHERE id = ?`,
      [status, user.id, params.id]
    );

    // Notifications logic would be triggered here (e.g. Email the member)
    // if (status === 'VERIFIED') sendEmail(userId, "Contribution received...");

    return NextResponse.json({ message: `Contribution marked as ${status}` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
