import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: obituaries, error } = await supabase
      .from('obituaries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ obituaries });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check user role from users table
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userProfile || (userProfile.role !== 'ADMIN' && userProfile.role !== 'SUPER_ADMIN' && userProfile.role !== 'TREASURER')) {
      return NextResponse.json({ error: 'Forbidden: Requires Admin or Treasurer role' }, { status: 403 });
    }

    const body = await request.json();
    const { deceased_name, biography, photo_url, funeral_dates_venues, spokesperson_contact, contribution_expiry } = body;

    if (!deceased_name) {
      return NextResponse.json({ error: 'Deceased name is required' }, { status: 400 });
    }

    const { data: insertResult, error: insertError } = await supabase
      .from('obituaries')
      .insert([
        {
          deceased_name,
          biography,
          photo_url,
          funeral_dates_venues,
          spokesperson_contact,
          contribution_expiry: contribution_expiry || null
        }
      ])
      .select('id')
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Obituary created', id: insertResult.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
