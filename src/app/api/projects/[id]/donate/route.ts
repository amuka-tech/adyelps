import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

async function getUserFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as any;
  } catch (err) {
    return null;
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromCookie();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const { amount, is_anonymous } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid donation amount' }, { status: 400 });
    }

    // Insert the donation record
    await query(
      `INSERT INTO project_donations (project_id, user_id, amount, is_anonymous, payment_status) VALUES (?, ?, ?, ?, 'COMPLETED')`,
      [projectId, user.id, amount, is_anonymous ? 1 : 0]
    );

    // Update the total raised amount on the project
    await query(
      `UPDATE projects SET raised_amount = raised_amount + ? WHERE id = ?`,
      [amount, projectId]
    );

    return NextResponse.json({ message: 'Donation successful! Thank you for giving back.' });
  } catch (error: any) {
    console.error("Donation error:", error);
    return NextResponse.json({ error: 'Failed to process donation' }, { status: 500 });
  }
}
