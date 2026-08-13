import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query = supabase
      .from('users')
      .select('id, first_name, last_name, email, role, class_year, profession, account_status, created_at')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    const { data: users } = await query;
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Fetch superadmin users error:", error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
