import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supabase = createClient(await cookies());
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || ((userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') && userData.role !== 'TREASURER')) {
      return NextResponse.json({ error: 'Forbidden: Requires Admin or Treasurer role' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; // 'VERIFIED' or 'REJECTED'

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { error } = await supabase
      .from('contributions')
      .update({ status, verified_by_id: user.id })
      .eq('id', params.id);

    if (error) throw error;

    // Notifications logic would be triggered here (e.g. Email the member)
    // if (status === 'VERIFIED') sendEmail(userId, "Contribution received...");

    return NextResponse.json({ message: `Contribution marked as ${status}` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
