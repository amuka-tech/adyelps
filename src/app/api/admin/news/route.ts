import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let sql = `
      SELECT n.*, u.first_name, u.last_name 
      FROM news_articles n
      JOIN users u ON n.author_id = u.id
    `;
    const params: any[] = [];

    if (status) {
      sql += ` WHERE n.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY n.created_at DESC`;

    const articles = await query(sql, params);
    return NextResponse.json({ articles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, image_url, category, status } = body;

    const published_at = status === 'PUBLISHED' ? new Date() : null;

    const result: any = await query(`
      INSERT INTO news_articles (title, content, image_url, category, status, author_id, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [title, content, image_url, category, status || 'DRAFT', user.id, published_at]);

    return NextResponse.json({ message: 'Article created successfully', id: result.insertId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
