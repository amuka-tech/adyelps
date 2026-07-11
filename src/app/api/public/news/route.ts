import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const articles = await query(
      `SELECT n.id, n.title, n.content, n.image_url, n.category, n.created_at, u.first_name, u.last_name 
       FROM news_articles n 
       JOIN users u ON n.author_id = u.id 
       WHERE n.status = 'PUBLISHED' 
       ORDER BY n.created_at DESC`
    );

    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Error fetching public news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
