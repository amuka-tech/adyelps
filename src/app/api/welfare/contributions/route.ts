import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Fetch all contributions for a specific obituary, or all pending (Admin)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const obituaryId = searchParams.get('obituary_id');
    
    const supabase = createClient(await cookies());
    
    let query = supabase
      .from('contributions')
      .select('*, users!inner(first_name, last_name, email)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }
    if (obituaryId) {
      query = query.eq('obituary_id', obituaryId);
    }
    
    const { data: contributionsData, error } = await query;
    if (error) throw error;
    
    const contributions = contributionsData?.map((c: any) => ({
      ...c,
      first_name: c.users.first_name,
      last_name: c.users.last_name,
      email: c.users.email,
      users: undefined
    }));

    return NextResponse.json({ contributions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Log a new contribution (Members)
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { obituary_id, amount_gross, payment_method } = body;

    if (!obituary_id || !amount_gross || !payment_method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('contributions')
      .insert({
        obituary_id,
        user_id: user.id,
        amount_gross,
        payment_method
      });

    if (error) throw error;

    return NextResponse.json({ message: 'Contribution logged successfully and is pending verification.' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
