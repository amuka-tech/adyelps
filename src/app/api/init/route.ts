import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Database initialization should be handled via Supabase migrations.' });
}
