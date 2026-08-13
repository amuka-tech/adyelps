import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: projectsData, error } = await supabase
      .from('projects')
      .select(`
        *,
        users (first_name, last_name)
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const projects = projectsData?.map((p: any) => ({
      ...p,
      first_name: p.users?.first_name,
      last_name: p.users?.last_name
    })) || [];
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error("Fetch projects error:", error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    
    // You would typically fetch user role from your database if using custom roles
    // For this migration, we assume role is part of user metadata or we fetch it from users table
    let userRole = null;
    if (user) {
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
      userRole = userData?.role;
    }

    if (!user || (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    const { title, description, goal_amount, image_url, deadline } = await request.json();

    if (!title || !description || !goal_amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        goal_amount,
        image_url: image_url || null,
        deadline: deadline || null,
        created_by_id: user.id
      })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ message: 'Project created successfully', projectId: data.id });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
