import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get orders
    const orders: any[] = await query(`
      SELECT * FROM shop_orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [user.id]) as any[];

    // Get items for these orders
    for (const order of orders) {
      const items = await query(`
        SELECT i.quantity, i.price_at_purchase, p.name, p.image_url
        FROM shop_order_items i
        JOIN shop_products p ON i.product_id = p.id
        WHERE i.order_id = ?
      `, [order.id]);
      order.items = items;
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
