import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supabase = createClient(await cookies());

    const { data: obituary, error: obitError } = await supabase
      .from('obituaries')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (obitError || !obituary) {
      return NextResponse.json({ error: 'Obituary not found' }, { status: 404 });
    }

    const { data: condolences, error: condolencesError } = await supabase
      .from('condolences')
      .select(`
        *,
        users (first_name, last_name, class_year, profession)
      `)
      .eq('obituary_id', params.id)
      .eq('status', 'APPROVED')
      .order('created_at', { ascending: false });

    if (condolencesError) throw condolencesError;

    // Map the response to match the old format
    const formattedCondolences = condolences?.map((c: any) => ({
      ...c,
      first_name: c.users?.first_name,
      last_name: c.users?.last_name,
      class_year: c.users?.class_year,
      profession: c.users?.profession,
      users: undefined // remove the nested object
    }));

    return NextResponse.json({ 
      obituary,
      condolences: formattedCondolences
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
