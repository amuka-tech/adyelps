import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shipping_address } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.price * item.quantity;
      
      const { data: product } = await supabase
        .from('shop_products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single();
        
      if (product) {
        const newStock = Math.max(0, product.stock_quantity - item.quantity);
        await supabase
          .from('shop_products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product_id);
      }
    }

    const { data: orderResult, error: orderError } = await supabase
      .from('shop_orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'PENDING',
        shipping_address: shipping_address || 'Pickup at School'
      })
      .select('id')
      .single();

    if (orderError) throw orderError;
    const orderId = orderResult.id;

    for (const item of items) {
      await supabase
        .from('shop_order_items')
        .insert({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price_at_purchase: item.price
        });
    }

    return NextResponse.json({ message: 'Order placed successfully', orderId });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: 'Failed to process checkout' }, { status: 500 });
  }
}
