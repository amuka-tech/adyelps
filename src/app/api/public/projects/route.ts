import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title, description, goal_amount, raised_amount, image_url, status')
      .in('status', ['ACTIVE', 'COMPLETED'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
