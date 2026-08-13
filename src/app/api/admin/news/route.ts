import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const supabase = createClient(await cookies());

    let query = supabase
      .from('news_articles')
      .select('*, users(first_name, last_name)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    const articles = data.map((article: any) => {
      const { users, ...rest } = article;
      return {
        ...rest,
        first_name: users?.first_name,
        last_name: users?.last_name
      };
    });

    return NextResponse.json({ articles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!userData || userData.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, image_url, category, status } = body;

    const published_at = status === 'PUBLISHED' ? new Date().toISOString() : null;

    const { data: result, error } = await supabase
      .from('news_articles')
      .insert([{
        title,
        content,
        image_url,
        category,
        status: status || 'DRAFT',
        author_id: user.id,
        published_at
      }])
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Article created successfully', id: result.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
