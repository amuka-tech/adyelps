import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: ordersResult, error: ordersError } = await supabase
      .from('shop_orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (ordersError) throw ordersError;
    
    const orders = ordersResult || [];

    for (const order of orders) {
      const { data: items, error: itemsError } = await supabase
        .from('shop_order_items')
        .select('quantity, price_at_purchase, product:shop_products(name, image_url)')
        .eq('order_id', order.id);
        
      if (!itemsError && items) {
        order.items = items.map((i: any) => ({
          quantity: i.quantity,
          price_at_purchase: i.price_at_purchase,
          name: i.product?.name,
          image_url: i.product?.image_url
        }));
      } else {
        order.items = [];
      }
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
