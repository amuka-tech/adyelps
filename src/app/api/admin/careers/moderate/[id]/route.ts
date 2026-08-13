import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const params = await context.params;
    const jobId = params.id;

    const body = await request.json();
    const { status } = body;

    if (!['ACTIVE', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await supabase.from('jobs').update({ status }).eq('id', jobId);

    return NextResponse.json({ message: `Job marked as ${status}` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
