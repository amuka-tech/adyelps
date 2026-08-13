import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const classYear = searchParams.get('class_year');
    const profession = searchParams.get('profession');
    
    let query = supabase.from('users').select('id, first_name, last_name, class_year, profession, email, phone, hide_contact_info');

    if (classYear) {
      query = query.eq('class_year', classYear);
    }
    
    if (profession) {
      query = query.ilike('profession', `%${profession}%`);
    }

    query = query.order('class_year', { ascending: false }).order('first_name', { ascending: true });

    const { data: members, error: queryError } = await query;
    if (queryError) throw queryError;

    // Apply privacy masking
    const safeMembers = (members || []).map((member: any) => {
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
