import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { id: projectId } = await params;

    // Fetch the project details
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select(`
        *,
        users (first_name, last_name)
      `)
      .eq('id', projectId)
      .single();

    if (projectError || !projectData) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = {
      ...projectData,
      first_name: (projectData as any).users?.first_name,
      last_name: (projectData as any).users?.last_name
    };

    // Fetch the donations (Leaderboard)
    const { data: donationsData, error: donationsError } = await supabase
      .from('project_donations')
      .select(`
        id, amount, is_anonymous, created_at,
        users (first_name, last_name, class_year)
      `)
      .eq('project_id', projectId)
      .eq('payment_status', 'COMPLETED')
      .order('amount', { ascending: false })
      .order('created_at', { ascending: false });

    if (donationsError) throw donationsError;

    // Mask anonymous donations
    const formattedDonations = (donationsData || []).map((d: any) => {
      if (d.is_anonymous) {
        return {
          id: d.id,
          amount: d.amount,
          created_at: d.created_at,
          first_name: 'Anonymous',
          last_name: 'Alumni',
          class_year: null
        };
      }
      return {
        id: d.id,
        amount: d.amount,
        created_at: d.created_at,
        first_name: d.users?.first_name,
        last_name: d.users?.last_name,
        class_year: d.users?.class_year
      };
    });

    // Fetch project updates (Milestones)
    const { data: updates, error: updatesError } = await supabase
      .from('project_updates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (updatesError) throw updatesError;

    return NextResponse.json({ project, donations: formattedDonations, updates });
  } catch (error: any) {
    console.error("Fetch project details error:", error);
    return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
  }
}
