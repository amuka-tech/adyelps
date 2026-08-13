import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (!userData || userData.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const { data: ordersData, error } = await supabase
      .from('shop_orders')
      .select(`
        *,
        users (first_name, last_name, email)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const orders = ordersData?.map((o: any) => ({
      ...o,
      first_name: o.users?.first_name,
      last_name: o.users?.last_name,
      email: o.users?.email,
    }));
    
    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
