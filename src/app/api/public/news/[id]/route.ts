import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createClient(await cookies());

    const { data: articles, error } = await supabase
      .from('news_articles')
      .select(`id, title, content, image_url, category, created_at, users!inner(first_name, last_name)`)
      .eq('id', id)
      .eq('status', 'PUBLISHED');

    if (error) throw error;

    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const user = Array.isArray(articles[0].users) ? articles[0].users[0] : articles[0].users;
    const article = {
      ...articles[0],
      first_name: (user as any)?.first_name,
      last_name: (user as any)?.last_name,
      users: undefined
    };

    return NextResponse.json({ article });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
