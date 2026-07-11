import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING';

    const sql = `
      SELECT c.*, u.first_name, u.last_name, u.email, o.deceased_name 
      FROM condolences c
      JOIN users u ON c.user_id = u.id
      JOIN obituaries o ON c.obituary_id = o.id
      WHERE c.status = ?
      ORDER BY c.created_at DESC
    `;
    
    const condolences = await query(sql, [status]);
    return NextResponse.json({ condolences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
