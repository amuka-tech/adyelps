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
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result: any = await query(`SELECT notification_preferences FROM users WHERE id = ?`, [user.id]);
    
    let preferences = { email_enabled: true, sms_enabled: false, in_app_enabled: true, marketing_emails: false };
    if (result && result.length > 0 && result[0].notification_preferences) {
      preferences = typeof result[0].notification_preferences === 'string' 
        ? JSON.parse(result[0].notification_preferences) 
        : result[0].notification_preferences;
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    await query(
      `UPDATE users SET notification_preferences = ? WHERE id = ?`,
      [JSON.stringify(body), user.id]
    );

    return NextResponse.json({ message: 'Preferences updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
