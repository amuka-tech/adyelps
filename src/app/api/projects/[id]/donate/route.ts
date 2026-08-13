import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { amount, is_anonymous } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 });
    }

    // Insert the donation record
    const { error: insertError } = await supabase.from('project_donations').insert({
      project_id: projectId,
      user_id: user.id,
      amount,
      is_anonymous: is_anonymous ? true : false,
      payment_status: 'COMPLETED'
    });

    if (insertError) throw insertError;

    // Update the total raised amount on the project
    const { data: project } = await supabase
      .from('projects')
      .select('raised_amount')
      .eq('id', projectId)
      .single();

    if (project) {
      await supabase
        .from('projects')
        .update({ raised_amount: (project.raised_amount || 0) + amount })
        .eq('id', projectId);
    }

    return NextResponse.json({ message: 'Donation successful! Thank you for giving back.' });
  } catch (error: any) {
    console.error("Donation error:", error);
    return NextResponse.json({ error: 'Failed to process donation' }, { status: 500 });
  }
}
