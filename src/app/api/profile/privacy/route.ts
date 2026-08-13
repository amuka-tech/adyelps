import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function PUT(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { hide_contact_info } = body;

    const { error: updateError } = await supabase
      .from('users')
      .update({ hide_contact_info: hide_contact_info ? true : false })
      .eq('id', user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Privacy settings updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
