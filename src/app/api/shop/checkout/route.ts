import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shipping_address } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Calculate total and verify stock (in a real app we'd query DB for current prices/stock)
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
      // Subtract stock
      await query(`UPDATE shop_products SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?`, [item.quantity, item.product_id]);
    }

    // 2. Create Order
    const orderResult: any = await query(`
      INSERT INTO shop_orders (user_id, total_amount, status, shipping_address)
      VALUES (?, ?, 'PENDING', ?)
    `, [user.id, totalAmount, shipping_address || 'Pickup at School']);

    const orderId = orderResult.insertId;

    // 3. Create Order Items
    for (const item of items) {
      await query(`
        INSERT INTO shop_order_items (order_id, product_id, quantity, price_at_purchase)
        VALUES (?, ?, ?, ?)
      `, [orderId, item.product_id, item.quantity, item.price]);
    }

    return NextResponse.json({ message: 'Order placed successfully', orderId });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
