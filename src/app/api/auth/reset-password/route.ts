import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const supabase = createClient(await cookies());

    // Verify token
    const { data: resets, error: resetError } = await supabase
      .from('password_resets')
      .select('*')
      .eq('token', token)
      .eq('used', 0)
      .gt('expires_at', new Date().toISOString());

    if (resetError || !resets || resets.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token. Please request a new one.' }, { status: 400 });
    }

    const resetRecord = resets[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', resetRecord.user_id);
      
    if (updateError) throw updateError;

    // Mark token as used
    const { error: markUsedError } = await supabase
      .from('password_resets')
      .update({ used: 1 })
      .eq('id', resetRecord.id);
      
    if (markUsedError) throw markUsedError;

    return NextResponse.json({ message: 'Password has been successfully reset. You may now log in.' });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
