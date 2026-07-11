import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const products = await query(`
      SELECT id, name, description, price, stock_quantity, image_url 
      FROM shop_products 
      WHERE status = 'ACTIVE' 
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
