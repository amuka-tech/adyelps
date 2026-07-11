import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Fetch all contributions for a specific obituary, or all pending (Admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const obituaryId = searchParams.get('obituary_id');
    
    let sql = `
      SELECT c.*, u.first_name, u.last_name, u.email 
      FROM contributions c
      JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ` AND c.status = ?`;
      params.push(status);
    }
    if (obituaryId) {
      sql += ` AND c.obituary_id = ?`;
      params.push(obituaryId);
    }

    sql += ` ORDER BY c.created_at DESC`;
    
    const contributions = await query(sql, params);
    return NextResponse.json({ contributions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Log a new contribution (Members)
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { obituary_id, amount_gross, payment_method } = body;

    if (!obituary_id || !amount_gross || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      `INSERT INTO contributions (obituary_id, user_id, amount_gross, payment_method) VALUES (?, ?, ?, ?)`,
      [obituary_id, user.id, amount_gross, payment_method]
    );

    return NextResponse.json({ message: 'Contribution logged successfully and is pending verification.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
