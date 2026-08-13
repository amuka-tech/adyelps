import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { logAction } from '@/lib/audit';

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
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const settings = await query(`SELECT * FROM system_settings`);
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getSuperAdminFromCookie();
    if (!admin) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { key, value, description } = await request.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
    }

    await query(
      `INSERT INTO system_settings (setting_key, setting_value, description) 
       VALUES (?, ?, ?) 
       ON CONFLICT(setting_key) DO UPDATE SET setting_value = ?, description = ?`,
      [key, value, description || '', value, description || '']
    );

    await logAction(admin.id, 'UPDATE_SYSTEM_SETTING', `Updated setting ${key} to ${value}`);

    return NextResponse.json({ message: 'Setting saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
