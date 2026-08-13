import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: result, error } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', user.id);
      
    if (error) throw error;
    
    let preferences = { email_enabled: true, sms_enabled: false, in_app_enabled: true, marketing_emails: false };
    if (result && result.length > 0 && result[0].notification_preferences) {
      preferences = typeof result[0].notification_preferences === 'string' 
        ? JSON.parse(result[0].notification_preferences) 
        : result[0].notification_preferences;
    }

    return NextResponse.json({ preferences });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    const { error } = await supabase
      .from('users')
      .update({ notification_preferences: JSON.stringify(body) })
      .eq('id', user.id);

    if (error) throw error;

    return NextResponse.json({ message: 'Preferences updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
