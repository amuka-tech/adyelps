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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let sql = `
      SELECT id, first_name, last_name, email, role, class_year, profession, account_status, created_at 
      FROM users 
    `;
    const params: any[] = [];

    if (search) {
      sql += ` WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ? `;
      const likeQuery = `%${search}%`;
      params.push(likeQuery, likeQuery, likeQuery);
    }

    sql += ` ORDER BY created_at DESC`;

    const users = await query(sql, params);
    
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Fetch superadmin users error:", error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
