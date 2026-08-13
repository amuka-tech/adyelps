import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { logAction } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: settings } = await supabase.from('system_settings').select('*');
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { key, value, description } = await request.json();

    if (!key || !value) {
      return NextResponse.json({ error: 'Key and Value are required' }, { status: 400 });
    }

    await supabase.from('system_settings').upsert(
      { setting_key: key, setting_value: value, description: description || '' },
      { onConflict: 'setting_key' }
    );

    await logAction(user.id, 'UPDATE_SYSTEM_SETTING', `Updated setting ${key} to ${value}`);

    return NextResponse.json({ message: 'Setting saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
