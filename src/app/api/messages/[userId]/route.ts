import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// GET chat history with a specific user
export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const { userId } = await params; // Next 15 requirement
    
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactId = userId; // In Supabase, id is usually UUID string, but here might be int or string. We use string as it handles UUID or numbers usually

    // Fetch conversation
    const { data: rawMessages, error: msgError } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, is_read, created_at')
      .in('sender_id', [user.id, contactId])
      .in('receiver_id', [user.id, contactId])
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    // Filter to ensure it's strictly between these two
    const messages = rawMessages?.filter((m: any) => 
      (m.sender_id === user.id && m.receiver_id === contactId) ||
      (m.sender_id === contactId && m.receiver_id === user.id)
    ) || [];

    // Also fetch the contact's basic info
    const { data: contactInfo } = await supabase
      .from('users')
      .select('id, first_name, last_name, profession')
      .eq('id', contactId)
      .single();

    return NextResponse.json({ messages, contact: contactInfo });
  } catch (error: any) {
    console.error("Fetch conversation error:", error);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}

// PATCH to mark messages as read
export async function PATCH(request: Request, context: any) {
  try {
    const { params } = context;
    const { userId } = await params;
    
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contactId = userId;

    // Update all unread messages sent BY the contact TO the logged-in user
    const { error: updateError } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', contactId)
      .eq('receiver_id', user.id)
      .eq('is_read', false);

    if (updateError) throw updateError;

    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    console.error("Mark as read error:", error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
