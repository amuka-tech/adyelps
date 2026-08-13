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

    // Parallel queries for fast stats
    const [
      usersResult,
      projectsResult,
      obituariesResult,
      jobsResult,
      bizResult
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('raised_amount'),
      supabase.from('contributions').select('amount_gross').eq('status', 'VERIFIED'),
      supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE'),
      supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'ACTIVE')
    ]);

    const totalUsers = usersResult.count || 0;
    const totalProjectsRaised = projectsResult.data?.reduce((sum, p) => sum + Number(p.raised_amount), 0) || 0;
    const totalWelfareRaised = obituariesResult.data?.reduce((sum, c) => sum + Number(c.amount_gross), 0) || 0;
    const totalActiveJobs = jobsResult.count || 0;
    const totalActiveBiz = bizResult.count || 0;

    return NextResponse.json({ 
      stats: {
        totalUsers,
        totalFundsRaised: Number(totalProjectsRaised) + Number(totalWelfareRaised),
        totalActiveJobs,
        totalActiveBiz
      }
    });
  } catch (error: any) {
    console.error("Fetch superadmin stats error:", error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
