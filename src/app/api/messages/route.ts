import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get the most recent message per conversation (either sender or receiver)
    // and count unread messages for the current user.
    const sql = `
      SELECT 
        u.id as contact_id, 
        u.first_name, 
        u.last_name, 
        u.profession,
        m.content as last_message, 
        m.created_at as last_message_date,
        m.sender_id,
        (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM users u
      JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = u.id)
      WHERE m.id IN (
        SELECT MAX(id) FROM messages 
        WHERE sender_id = ? OR receiver_id = ? 
        GROUP BY IF(sender_id = ?, receiver_id, sender_id)
      )
      ORDER BY m.created_at DESC
    `;
    
    const conversations = await query(sql, [user.id, user.id, user.id, user.id, user.id, user.id]);

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Fetch inbox error:", error);
    return NextResponse.json({ error: 'Failed to fetch inbox' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const sender: any = await verifyToken(token);
    if (!sender) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { receiver_id, content } = body;

    if (!receiver_id || !content) {
      return NextResponse.json({ error: 'Missing recipient or content' }, { status: 400 });
    }

    // Insert message into DB
    const insertRes: any = await query(
      `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
      [sender.id, receiver_id, content]
    );

    const messageId = insertRes.insertId;

    // Get receiver details for email notification
    const receiverResult: any = await query(`SELECT email, first_name, notification_preferences FROM users WHERE id = ?`, [receiver_id]);
    if (receiverResult && receiverResult.length > 0) {
      const receiver = receiverResult[0];
      
      let emailEnabled = true;
      if (receiver.notification_preferences) {
        const prefs = typeof receiver.notification_preferences === 'string' 
          ? JSON.parse(receiver.notification_preferences) 
          : receiver.notification_preferences;
        if (prefs.email_enabled === false) emailEnabled = false;
      }

      if (emailEnabled) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const inboxUrl = `${baseUrl}/dashboard/messages/${sender.id}`;

        const emailHtml = `
          <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #800000;">New Message on Adyel Alumni</h2>
            <p>Hello ${receiver.first_name},</p>
            <p>You have received a new direct message from <strong>${sender.first_name} ${sender.last_name}</strong>.</p>
            <blockquote style="border-left: 4px solid #800000; padding-left: 15px; margin: 20px 0; font-style: italic; color: #555;">
              "${content}"
            </blockquote>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inboxUrl}" style="background-color: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reply to Message</a>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 30px;">&copy; ${new Date().getFullYear()} Adyel Alumni Association.</p>
          </div>
        `;

        if (receiver.email) {
          await sendEmail(receiver.email, `New message from ${sender.first_name} ${sender.last_name}`, emailHtml).catch(err => {
            console.error("Failed to send notification email:", err);
            // We don't throw an error here because the internal message was successfully delivered
          });
        }
      }
    }

    return NextResponse.json({ 
      message: 'Message sent successfully',
      data: { id: messageId, sender_id: sender.id, receiver_id, content, is_read: 0, created_at: new Date() }
    });

  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
