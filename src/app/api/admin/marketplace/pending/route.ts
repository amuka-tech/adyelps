import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get both pending for approval AND active for toggling featured status
    const { data: rawPendingBusinesses, error: pendingError } = await supabase
      .from('businesses')
      .select('*, users (first_name, last_name, email)')
      .eq('status', 'PENDING')
      .order('created_at', { ascending: true });

    if (pendingError) throw pendingError;

    // Flatten user fields to match original SQL response
    const pendingBusinesses = rawPendingBusinesses?.map((b: any) => {
      const userObj = Array.isArray(b.users) ? b.users[0] : b.users;
      const flatB = {
        ...b,
        first_name: userObj?.first_name,
        last_name: userObj?.last_name,
        email: userObj?.email,
      };
      delete flatB.users;
      return flatB;
    }) || [];

    const { data: activeBusinesses, error: activeError } = await supabase
      .from('businesses')
      .select('id, business_name, category, is_featured')
      .eq('status', 'ACTIVE')
      .order('business_name', { ascending: true });

    if (activeError) throw activeError;

    return NextResponse.json({ pendingBusinesses, activeBusinesses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
