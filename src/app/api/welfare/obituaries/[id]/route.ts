import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const obituaries: any = await query(`SELECT * FROM obituaries WHERE id = ?`, [params.id]);
    
    if (obituaries.length === 0) {
      return NextResponse.json({ error: 'Obituary not found' }, { status: 404 });
    }

    const condolences: any = await query(`
      SELECT c.*, u.first_name, u.last_name, u.class_year, u.profession 
      FROM condolences c 
      JOIN users u ON c.user_id = u.id 
      WHERE c.obituary_id = ? AND c.status = 'APPROVED'
      ORDER BY c.created_at DESC
    `, [params.id]);

    return NextResponse.json({ 
      obituary: obituaries[0],
      condolences
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
