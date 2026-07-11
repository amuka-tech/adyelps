import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const products: any = await query(`
      SELECT id, name, description, price, stock_quantity, image_url 
      FROM shop_products 
      WHERE id = ? AND status = 'ACTIVE'
    `, [id]);

    if (products.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
