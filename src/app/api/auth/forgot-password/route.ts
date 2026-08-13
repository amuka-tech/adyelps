import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(await cookies());

    // Check if user exists
    const { data: users, error: selectError } = await supabase
      .from('users')
      .select('id, first_name')
      .eq('email', email);

    if (selectError || !users || users.length === 0) {
      // Return success even if not found to prevent email enumeration attacks
      return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const user = users[0];

    // Generate random token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Insert into DB
    const { error: insertError } = await supabase
      .from('password_resets')
      .insert([
        { user_id: user.id, token, expires_at: expiresAt.toISOString() }
      ]);
      
    if (insertError) throw insertError;

    // Construct reset URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    const emailHtml = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #800000;">LTC Alumni Platform</h2>
        <p>Hello ${user.first_name},</p>
        <p>We received a request to reset your password. Click the button below to choose a new password. This link will expire in 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="color: #888; font-size: 12px; margin-top: 30px;">&copy; ${new Date().getFullYear()} LTC Adyel Alumni Network.</p>
      </div>
    `;

    await sendEmail(email, 'Password Reset Request', emailHtml);

    return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
