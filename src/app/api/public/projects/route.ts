import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const projects = await query(`
      SELECT id, title, description, goal_amount, raised_amount, image_url, status 
      FROM projects 
      WHERE status = 'ACTIVE' OR status = 'COMPLETED'
      ORDER BY created_at DESC
    `);
    
    return NextResponse.json({ projects });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
