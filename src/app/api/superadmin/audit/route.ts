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
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const logs = await query(`
      SELECT a.id, a.action, a.description, a.ip_address, a.created_at, u.first_name, u.last_name
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Audit log error:", error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
