import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Fetch polls and their options
    const pollsResult: any = await query(`
      SELECT p.*, u.first_name, u.last_name 
      FROM polls p
      JOIN users u ON p.created_by_id = u.id
      ORDER BY p.start_date DESC
    `);

    // Fetch options and tally votes
    for (let poll of pollsResult) {
      const optionsResult: any = await query(`
        SELECT po.id, po.option_text, COUNT(pv.id) as vote_count
        FROM poll_options po
        LEFT JOIN poll_votes pv ON po.id = pv.poll_option_id
        WHERE po.poll_id = ?
        GROUP BY po.id
      `, [poll.id]);
      
      poll.options = optionsResult;

      // Calculate total votes
      poll.total_votes = optionsResult.reduce((sum: number, opt: any) => sum + parseInt(opt.vote_count), 0);
    }

    return NextResponse.json({ polls: pollsResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
