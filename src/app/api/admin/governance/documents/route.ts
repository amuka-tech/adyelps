import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || ((user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') && user.role !== 'TREASURER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { title, doc_type, file_url } = body;

    if (!title || !doc_type || !file_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Insert Document
    await query(
      `INSERT INTO documents (title, doc_type, file_url, uploaded_by_id) 
       VALUES (?, ?, ?, ?)`,
      [title, doc_type, file_url, user.id]
    );

    return NextResponse.json({ message: 'Document added to vault securely' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
