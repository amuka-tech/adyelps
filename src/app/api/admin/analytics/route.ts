import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. User Metrics
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: pendingUsers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('account_status', 'PENDING');
    const { count: totalAlumni } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'ALUMNI_MEMBER');
    
    const userMetrics = { 
      totalUsers: totalUsers || 0, 
      pendingUsers: pendingUsers || 0, 
      totalAlumni: totalAlumni || 0 
    };

    // 2. Engagement Metrics
    const { count: totalEvents } = await supabase.from('events').select('*', { count: 'exact', head: true });
    const { count: totalMessages } = await supabase.from('messages').select('*', { count: 'exact', head: true });
    const { count: totalBusinesses } = await supabase.from('businesses').select('*', { count: 'exact', head: true });
    
    const engagementMetrics = {
      totalEvents: totalEvents || 0,
      totalMessages: totalMessages || 0,
      totalBusinesses: totalBusinesses || 0
    };

    // 3. Financial Metrics
    const { data: txData } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('status', 'SUCCESS');

    const financialMetrics = {
      totalRevenue: 0,
      breakdown: {
        shop: 0,
        events: 0,
        welfare: 0
      }
    };

    if (txData && txData.length > 0) {
      txData.forEach((row: any) => {
        const amount = parseFloat(row.amount);
        financialMetrics.totalRevenue += amount;
        
        if (row.type === 'SHOP_ORDER') financialMetrics.breakdown.shop += amount;
        else if (row.type === 'EVENT_TICKET') financialMetrics.breakdown.events += amount;
        else if (row.type === 'WELFARE_CONTRIBUTION') financialMetrics.breakdown.welfare += amount;
      });
    }

    // 4. Recent Activity (Latest 5 Transactions)
    const { data: recentActivityResult } = await supabase
      .from('transactions')
      .select('id, type, amount, status, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      userMetrics,
      engagementMetrics,
      financialMetrics,
      recentActivity: recentActivityResult || []
    });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
