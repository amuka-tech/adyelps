import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: documentsData, error } = await supabase
      .from('documents')
      .select(`
        *,
        users (first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const documents = documentsData?.map((d: any) => ({
      ...d,
      first_name: d.users?.first_name,
      last_name: d.users?.last_name
    })) || [];

    return NextResponse.json({ documents });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
