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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get both pending for approval AND active for toggling featured status
    const pendingBusinesses = await query(`
      SELECT b.*, u.first_name, u.last_name, u.email 
      FROM businesses b
      JOIN users u ON b.owner_id = u.id
      WHERE b.status = 'PENDING'
      ORDER BY b.created_at ASC
    `);

    const activeBusinesses = await query(`
      SELECT b.id, b.business_name, b.category, b.is_featured 
      FROM businesses b
      WHERE b.status = 'ACTIVE'
      ORDER BY b.business_name ASC
    `);

    return NextResponse.json({ pendingBusinesses, activeBusinesses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
