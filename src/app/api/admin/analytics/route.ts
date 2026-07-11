import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. User Metrics
    const usersResult: any = await query(`
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN account_status = 'PENDING' THEN 1 ELSE 0 END) as pendingUsers,
        SUM(CASE WHEN role = 'ALUMNI_MEMBER' THEN 1 ELSE 0 END) as totalAlumni
      FROM users
    `);
    
    const userMetrics = usersResult[0] || { totalUsers: 0, pendingUsers: 0, totalAlumni: 0 };

    // 2. Engagement Metrics
    const eventsResult: any = await query(`SELECT COUNT(*) as totalEvents FROM events`);
    const messagesResult: any = await query(`SELECT COUNT(*) as totalMessages FROM messages`);
    const businessesResult: any = await query(`SELECT COUNT(*) as totalBusinesses FROM businesses`);
    
    const engagementMetrics = {
      totalEvents: eventsResult[0]?.totalEvents || 0,
      totalMessages: messagesResult[0]?.totalMessages || 0,
      totalBusinesses: businessesResult[0]?.totalBusinesses || 0
    };

    // 3. Financial Metrics
    // Calculate successful transactions grouped by type
    const txResult: any = await query(`
      SELECT type, SUM(amount) as totalAmount 
      FROM transactions 
      WHERE status = 'SUCCESS' 
      GROUP BY type
    `);

    const financialMetrics = {
      totalRevenue: 0,
      breakdown: {
        shop: 0,
        events: 0,
        welfare: 0
      }
    };

    if (txResult && txResult.length > 0) {
      txResult.forEach((row: any) => {
        const amount = parseFloat(row.totalAmount);
        financialMetrics.totalRevenue += amount;
        
        if (row.type === 'SHOP_ORDER') financialMetrics.breakdown.shop += amount;
        else if (row.type === 'EVENT_TICKET') financialMetrics.breakdown.events += amount;
        else if (row.type === 'WELFARE_CONTRIBUTION') financialMetrics.breakdown.welfare += amount;
      });
    }

    // 4. Recent Activity (Latest 5 Transactions)
    const recentActivityResult: any = await query(`
      SELECT id, type, amount, status, created_at 
      FROM transactions 
      ORDER BY created_at DESC 
      LIMIT 5
    `);

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
