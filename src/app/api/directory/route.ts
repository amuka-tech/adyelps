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

    const { searchParams } = new URL(request.url);
    const classYear = searchParams.get('class_year');
    const profession = searchParams.get('profession');
    
    let sql = `SELECT id, first_name, last_name, class_year, profession, email, phone, hide_contact_info FROM users WHERE 1=1`;
    let params: any[] = [];

    if (classYear) {
      sql += ` AND class_year = ?`;
      params.push(classYear);
    }
    
    if (profession) {
      sql += ` AND profession LIKE ?`;
      params.push(`%${profession}%`);
    }

    sql += ` ORDER BY class_year DESC, first_name ASC`;

    const members: any = await query(sql, params);

    // Apply privacy masking
    const safeMembers = members.map((member: any) => {
      if (member.hide_contact_info) {
        return {
          id: member.id,
          first_name: member.first_name,
          last_name: member.last_name,
          class_year: member.class_year,
          profession: member.profession,
          hide_contact_info: true
          // email and phone are omitted
        };
      }
      return member;
    });

    return NextResponse.json({ members: safeMembers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
