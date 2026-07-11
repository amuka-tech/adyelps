import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const obituaries = await query(`SELECT * FROM obituaries ORDER BY created_at DESC`);
    return NextResponse.json({ obituaries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      // NOTE: In testing, if no admin exists, we'll bypass role check if needed, 
      // but for proper RBAC we enforce it. 
      // For now, allow ADMIN or TREASURER. We'll set the current user to ADMIN manually in db later or let it pass for development if needed.
      // Wait, let's just enforce it so it's secure.
      if ((user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') && user.role !== 'TREASURER') {
         return NextResponse.json({ error: 'Forbidden: Requires Admin or Treasurer role' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { deceased_name, biography, photo_url, funeral_dates_venues, spokesperson_contact, contribution_expiry } = body;

    if (!deceased_name) {
      return NextResponse.json({ error: 'Deceased name is required' }, { status: 400 });
    }

    const insertResult: any = await query(
      `INSERT INTO obituaries (deceased_name, biography, photo_url, funeral_dates_venues, spokesperson_contact, contribution_expiry)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [deceased_name, biography, photo_url, funeral_dates_venues, spokesperson_contact, contribution_expiry || null]
    );

    return NextResponse.json({ message: 'Obituary created', id: insertResult.insertId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
