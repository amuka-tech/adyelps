import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || ((userData.role !== 'ADMIN' && userData.role !== 'SUPER_ADMIN') && userData.role !== 'TREASURER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, doc_type, file_url } = body;

    if (!title || !doc_type || !file_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert Document
    const { error } = await supabase.from('documents').insert([
      { title, doc_type, file_url, uploaded_by_id: user.id }
    ]);

    if (error) throw error;

    return NextResponse.json({ message: 'Document added to vault securely' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
