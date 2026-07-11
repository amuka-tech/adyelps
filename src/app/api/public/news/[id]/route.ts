import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const articles: any = await query(`
      SELECT n.id, n.title, n.content, n.image_url, n.category, n.created_at, u.first_name, u.last_name 
      FROM news_articles n 
      JOIN users u ON n.author_id = u.id 
      WHERE n.id = ? AND n.status = 'PUBLISHED'
    `, [id]);

    if (articles.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article: articles[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
