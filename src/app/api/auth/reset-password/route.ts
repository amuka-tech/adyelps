import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

    // Verify token
    const resets: any = await query(
      `SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()`,
      [token]
    );

    if (resets.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired reset token. Please request a new one.' }, { status: 400 });
    }

    const resetRecord = resets[0];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    await query(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, resetRecord.user_id]);

    // Mark token as used
    await query(`UPDATE password_resets SET used = 1 WHERE id = ?`, [resetRecord.id]);

    return NextResponse.json({ message: 'Password has been successfully reset. You may now log in.' });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
