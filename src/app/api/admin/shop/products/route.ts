import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const products = await query(`SELECT * FROM shop_products ORDER BY created_at DESC`);
    return NextResponse.json({ products });
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
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, stock_quantity, image_url, status } = body;

    const result: any = await query(`
      INSERT INTO shop_products (name, description, price, stock_quantity, image_url, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [name, description, price, stock_quantity, image_url, status || 'ACTIVE']);

    return NextResponse.json({ message: 'Product created successfully', id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
