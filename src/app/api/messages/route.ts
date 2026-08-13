import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all messages for the current user
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (msgError) throw msgError;

    // Fetch all users to map contact info
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, profession');

    if (usersError) throw usersError;

    const usersMap: Record<string, any> = {};
    if (users) {
      users.forEach(u => { usersMap[u.id] = u; });
    }

    const conversationsMap = new Map();

    if (messages) {
      for (const msg of messages) {
        const isSender = msg.sender_id === user.id;
        const contactId = isSender ? msg.receiver_id : msg.sender_id;

        if (!conversationsMap.has(contactId)) {
          const contact = usersMap[contactId] || {};
          conversationsMap.set(contactId, {
            contact_id: contactId,
            first_name: contact.first_name,
            last_name: contact.last_name,
            profession: contact.profession,
            last_message: msg.content,
            last_message_date: msg.created_at,
            sender_id: msg.sender_id,
            unread_count: 0
          });
        }

        // Count unread if current user is receiver
        if (!isSender && !msg.is_read) {
          const conv = conversationsMap.get(contactId);
          conv.unread_count += 1;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Fetch inbox error:", error);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user: sender }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !sender) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { receiver_id, content } = body;

    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'Missing recipient or content' }, { status: 400 });
    }

    // Insert message into DB
    const { data: insertedMsg, error: insertError } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: sender.id,
          receiver_id,
          content,
          is_read: false
        }
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    const messageId = insertedMsg.id;

    // Get receiver and sender details for email notification
    const { data: receiverResult } = await supabase
      .from('users')
      .select('email, first_name, notification_preferences')
      .eq('id', receiver_id)
      .single();

    const { data: senderResult } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', sender.id)
      .single();

    if (receiverResult && senderResult) {
      const receiver = receiverResult;
      
      let emailEnabled = true;
      if (receiver.notification_preferences) {
        const prefs = typeof receiver.notification_preferences === 'string' 
          ? JSON.parse(receiver.notification_preferences) 
          : receiver.notification_preferences;
        if (prefs.email_enabled === false) emailEnabled = false;
      }

      if (emailEnabled && receiver.email) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const inboxUrl = `${baseUrl}/dashboard/messages/${sender.id}`;

        const emailHtml = `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #800000;">New Message on LTC Alumni</h2>
            <p>Hello ${receiver.first_name},</p>
            <p>You have received a new direct message from <strong>${senderResult.first_name} ${senderResult.last_name}</strong>.</p>
            <blockquote style="border-left: 4px solid #800000; padding-left: 15px; margin: 20px 0; font-style: italic; color: #555;">
              "${content}"
            </blockquote>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inboxUrl}" style="background-color: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reply to Message</a>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">&copy; ${new Date().getFullYear()} LTC Adyel Alumni Network.</p>
          </div>
        `;

        await sendEmail(receiver.email, `New message from ${senderResult.first_name} ${senderResult.last_name}`, emailHtml).catch(err => {
          console.error("Failed to send notification email:", err);
          // We don't throw an error here because the internal message was successfully delivered
        });
      }
    }

    return NextResponse.json({ 
      message: 'Message sent successfully',
      data: insertedMsg
    });

  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
