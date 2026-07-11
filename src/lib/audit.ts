import { query } from './db';
import { headers } from 'next/headers';

/**
 * Logs an action to the immutable audit_logs table.
 * 
 * @param userId ID of the user performing the action
 * @param action Short string identifier for the action (e.g. 'delete_user')
 * @param description Detailed description of what happened
 */
export async function logAction(userId: number | null, action: string, description: string) {
  try {
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'Unknown IP';
    const userAgent = headersList.get('user-agent') || 'Unknown Device';

    await query(
      `INSERT INTO audit_logs (user_id, action, description, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
      [userId, action, description, ip, userAgent]
    );
  } catch (error) {
    console.error("Failed to write to audit log:", error);
    // We intentionally don't throw to avoid breaking the main request flow if logging fails
  }
}
