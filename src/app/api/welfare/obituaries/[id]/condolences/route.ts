import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (!user.id) {
      return NextResponse.json({ error: 'System Admin account cannot post condolences.' }, { status: 403 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { error: insertError } = await supabase
      .from('condolences')
      .insert([
        {
          obituary_id: params.id,
          user_id: user.id,
          message
        }
      ]);

    if (insertError) throw insertError;

    return NextResponse.json({ message: 'Condolence posted' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
