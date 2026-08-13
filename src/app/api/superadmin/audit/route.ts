import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Instead of JOIN, query logs and fetch users manually to avoid complex syntax if relationships aren't perfect
    const { data: logsData } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const logs = [];
    if (logsData) {
      for (const log of logsData) {
        let first_name = null;
        let last_name = null;
        if (log.user_id) {
          const { data: u } = await supabase.from('users').select('first_name, last_name').eq('id', log.user_id).single();
          if (u) {
            first_name = u.first_name;
            last_name = u.last_name;
          }
        }
        logs.push({
          id: log.id,
          action: log.action,
          description: log.description,
          ip_address: log.ip_address,
          created_at: log.created_at,
          first_name,
          last_name
        });
      }
    }

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Audit log error:", error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
