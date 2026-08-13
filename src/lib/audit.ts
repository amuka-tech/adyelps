import { createClient } from '@/utils/supabase/server';
import { headers, cookies } from 'next/headers';

/**
 * Logs an action to the immutable audit_logs table.
 * 
 * @param userId ID of the user performing the action
 * @param action Short string identifier for the action (e.g. 'delete_user')
 * @param description Detailed description of what happened
 */
export async function logAction(userId: string | null, action: string, description: string) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
    const userAgent = headersList.get('user-agent') || 'Unknown Device';

    const supabase = createClient(await cookies());

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      description,
      ip_address: ip,
      user_agent: userAgent
    });
  } catch (error) {
    console.error("Failed to write to audit log:", error);
    // We intentionally don't throw to avoid breaking the main request flow if logging fails
  }
}
