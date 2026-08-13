import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const jobId = params.id;

    const { data: jobData, error } = await supabase
      .from('jobs')
      .select(`
        *,
        users (
          first_name,
          last_name,
          email,
          phone
        )
      `)
      .eq('id', jobId)
      .single();

    if (error || !jobData) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const job = {
      ...jobData,
      first_name: (jobData as any).users?.first_name,
      last_name: (jobData as any).users?.last_name,
      email: (jobData as any).users?.email,
      phone: (jobData as any).users?.phone
    };

    return NextResponse.json({ job });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
