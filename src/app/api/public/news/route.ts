import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const supabase = createClient(await cookies());
    
    const { data: articlesResult, error } = await supabase
      .from('news_articles')
      .select('id, title, content, image_url, category, created_at, author:users(first_name, last_name)')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const articles = articlesResult.map((a: any) => ({
      ...a,
      first_name: a.author?.first_name,
      last_name: a.author?.last_name
    }));

    return NextResponse.json({ articles });
  } catch (error: any) {
    console.error('Error fetching public news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
