import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const rates = await query(`SELECT * FROM deduction_rates ORDER BY name ASC`);
    return NextResponse.json({ rates });
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
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Requires Admin role' }, { status: 403 });
    }

    const body = await request.json();
    const { name, rate_type, amount } = body;

    if (!name || !rate_type || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await query(
      `INSERT INTO deduction_rates (name, rate_type, amount) VALUES (?, ?, ?)`,
      [name, rate_type, amount]
    );

    return NextResponse.json({ message: 'Deduction rate added' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
