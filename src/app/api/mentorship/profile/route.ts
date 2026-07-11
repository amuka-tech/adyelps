import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const currentUser: any = await verifyToken(token);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles: any = await query('SELECT * FROM mentor_profiles WHERE user_id = ?', [currentUser.id]);
    
    if (profiles.length === 0) {
      return NextResponse.json({ profile: null });
    }

    const profile = profiles[0];
    profile.skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills) : profile.skills;
    
    return NextResponse.json({ profile });

  } catch (error: any) {
    console.error("Mentor Profile GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const currentUser: any = await verifyToken(token);
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { industry, bio, skills, is_accepting_mentees, max_mentees } = body;

    const existing: any = await query('SELECT id FROM mentor_profiles WHERE user_id = ?', [currentUser.id]);

    if (existing.length > 0) {
      // Update
      await query(`
        UPDATE mentor_profiles 
        SET industry = ?, bio = ?, skills = ?, is_accepting_mentees = ?, max_mentees = ?
        WHERE user_id = ?
      `, [industry, bio, JSON.stringify(skills), is_accepting_mentees ? 1 : 0, max_mentees, currentUser.id]);
    } else {
      // Insert
      await query(`
        INSERT INTO mentor_profiles (user_id, industry, bio, skills, is_accepting_mentees, max_mentees)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [currentUser.id, industry, bio, JSON.stringify(skills), is_accepting_mentees ? 1 : 0, max_mentees]);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Mentor Profile POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
