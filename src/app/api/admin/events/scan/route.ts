import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
      // In a real system, there might be an 'EVENT_STAFF' role, but we use ADMIN here
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { qr_token } = body;

    if (!qr_token) {
      return NextResponse.json({ error: 'Missing QR Token' }, { status: 400 });
    }

    // Find the ticket
    const { data: regs } = await supabase.from('event_registrations').select('*').eq('qr_token', qr_token);
    
    if (!regs || regs.length === 0) {
      return NextResponse.json({ valid: false, message: 'Invalid ticket - Not found in system' }, { status: 404 });
    }

    const reg = regs[0];
    const { data: u } = await supabase.from('users').select('first_name, last_name').eq('id', reg.user_id).single();
    const { data: t } = await supabase.from('event_ticket_tiers').select('name').eq('id', reg.ticket_tier_id).single();

    const ticket = {
      ...reg,
      first_name: u?.first_name,
      last_name: u?.last_name,
      tier_name: t?.name
    };

    if (ticket.status !== 'PAID') {
       return NextResponse.json({ valid: false, message: `Ticket status is ${ticket.status}. Payment required.` }, { status: 400 });
    }

    if (ticket.is_checked_in) {
      return NextResponse.json({ 
        valid: false, 
        message: 'TICKET ALREADY SCANNED',
        details: `${ticket.first_name} ${ticket.last_name} (${ticket.tier_name})`,
        check_in_time: ticket.check_in_time
      }, { status: 400 });
    }

    // Valid ticket, let's check them in
    const currentTime = new Date().toISOString();
    await supabase.from('event_registrations').update({ is_checked_in: true, check_in_time: currentTime }).eq('id', ticket.id);

    return NextResponse.json({ 
      valid: true, 
      message: 'VALID - LTC Alumnus Verified',
      details: `${ticket.first_name} ${ticket.last_name} (${ticket.tier_name})`
    }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
