import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: projectId } = await params;

    // Fetch the project details
    const projects: any = await query(`
      SELECT p.*, u.first_name, u.last_name 
      FROM projects p
      JOIN users u ON p.created_by_id = u.id
      WHERE p.id = ?
    `, [projectId]);

    if (projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0];

    // Fetch the donations (Leaderboard)
    const donations: any = await query(`
      SELECT d.id, d.amount, d.is_anonymous, d.created_at, 
             u.first_name, u.last_name, u.class_year
      FROM project_donations d
      JOIN users u ON d.user_id = u.id
      WHERE d.project_id = ? AND d.payment_status = 'COMPLETED'
      ORDER BY d.amount DESC, d.created_at DESC
    `, [projectId]);

    // Mask anonymous donations
    const formattedDonations = donations.map((d: any) => {
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
      return d;
    });

    // Fetch project updates (Milestones)
    const updates: any = await query(`
      SELECT * FROM project_updates
      WHERE project_id = ?
      ORDER BY created_at DESC
    `, [projectId]);

    return NextResponse.json({ project, donations: formattedDonations, updates });
  } catch (error: any) {
    console.error("Fetch project details error:", error);
    return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
  }
}
