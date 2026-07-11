import { NextResponse } from 'next/server';
import { logAction } from '@/lib/audit';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (token) {
    const user: any = await verifyToken(token);
    if (user) {
      await logAction(user.id, 'USER_LOGOUT', 'User logged out successfully');
    }
  }

  const response = NextResponse.json({ message: 'Logged out successfully' });
  
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}
