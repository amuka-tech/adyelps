import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: rates, error } = await supabase
      .from('deduction_rates')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) throw error;
    
    return NextResponse.json({ rates });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Requires Admin role' }, { status: 403 });
    }

    const body = await request.json();
    const { name, rate_type, amount } = body;

    if (!name || !rate_type || amount === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('deduction_rates')
      .insert({ name, rate_type, amount });

    if (error) throw error;

    return NextResponse.json({ message: 'Deduction rate added' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
