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

    // Fetch all active mentor profiles and their user details
    const mentors: any = await query(`
      SELECT 
        m.id as profile_id,
        m.industry,
        m.bio,
        m.skills,
        m.is_accepting_mentees,
        m.max_mentees,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.profession
      FROM mentor_profiles m
      JOIN users u ON m.user_id = u.id
      WHERE m.is_accepting_mentees = TRUE AND m.user_id != ?
    `, [currentUser.id]);

    // Simple matching algorithm: Boost score if they share an industry
    const rankedMentors = mentors.map((m: any) => {
      let score = 0;
      if (m.industry === currentUser.industry) {
        score += 50;
      }
      return {
        ...m,
        skills: typeof m.skills === 'string' ? JSON.parse(m.skills) : m.skills,
        matchScore: score
      };
    }).sort((a: any, b: any) => b.matchScore - a.matchScore);

    return NextResponse.json({ mentors: rankedMentors });

  } catch (error: any) {
    console.error("Mentors Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
