import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

async function getSuperAdminFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'SUPER_ADMIN' && (!(payload as any).assignedRoles || !(payload as any).assignedRoles.includes('Super Admin'))) return null;
    return payload as any;
  } catch (err) {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const admin = await getSuperAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });
    }

    // Parallel queries for fast stats
    const [
      usersResult,
      projectsResult,
      obituariesResult,
      jobsResult,
      bizResult
    ]: any[] = await Promise.all([
      query(`SELECT COUNT(*) as count FROM users`),
      query(`SELECT SUM(raised_amount) as total FROM projects`),
      query(`SELECT SUM(amount_gross) as total FROM contributions WHERE status = 'VERIFIED'`),
      query(`SELECT COUNT(*) as count FROM jobs WHERE status = 'ACTIVE'`),
      query(`SELECT COUNT(*) as count FROM businesses WHERE status = 'ACTIVE'`)
    ]);

    const totalUsers = usersResult[0].count;
    const totalProjectsRaised = projectsResult[0].total || 0;
    const totalWelfareRaised = obituariesResult[0].total || 0;
    const totalActiveJobs = jobsResult[0].count;
    const totalActiveBiz = bizResult[0].count;

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
