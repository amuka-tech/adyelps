import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET chat history with a specific user
export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const { userId } = await params; // Next 15 requirement
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contactId = parseInt(userId);

    // Fetch conversation
    const sql = `
      SELECT id, sender_id, receiver_id, content, is_read, created_at 
      FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `;
    const messages = await query(sql, [user.id, contactId, contactId, user.id]);

    // Also fetch the contact's basic info
    const contactRes: any = await query(`SELECT id, first_name, last_name, profession FROM users WHERE id = ?`, [contactId]);
    const contactInfo = contactRes.length > 0 ? contactRes[0] : null;

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
    
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const contactId = parseInt(userId);

    // Update all unread messages sent BY the contact TO the logged-in user
    await query(
      `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
      [contactId, user.id]
    );

    return NextResponse.json({ message: 'Messages marked as read' });
  } catch (error: any) {
    console.error("Mark as read error:", error);
    return NextResponse.json({ error: 'Failed to mark messages as read' }, { status: 500 });
  }
}
