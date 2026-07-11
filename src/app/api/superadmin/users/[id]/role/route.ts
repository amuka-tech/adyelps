import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { logAction } from '@/lib/audit';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_development_only_please_change');

async function getSuperAdminFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    // Fallback checking for Super Admin (either old enum or new RBAC permission/roles array)
    if (payload.role !== 'SUPER_ADMIN' && (!(payload as any).assignedRoles || !(payload as any).assignedRoles.includes('Super Admin'))) return null;
    return payload as any;
  } catch (err) {
    return null;
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getSuperAdminFromCookie();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });
    }

    const { id: userId } = await params;
    if (admin.id && admin.id.toString() === userId.toString()) {
      return NextResponse.json({ error: 'You cannot modify your own Super Admin account.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body; // action can be 'UPDATE_ROLES' or 'UPDATE_STATUS'

    if (action === 'UPDATE_ROLES') {
      const { roles } = body; // Array of role IDs
      
      // Clear existing roles
      await query(`DELETE FROM user_roles WHERE user_id = ?`, [userId]);
      
      // Insert new roles
      for (const roleId of roles) {
        await query(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId]);
      }

      // Legacy sync
      let primaryRole = 'MEMBER';
      if (roles.includes(1)) primaryRole = 'SUPER_ADMIN';
      else if (roles.includes(2)) primaryRole = 'ADMIN';
      else if (roles.includes(3)) primaryRole = 'TREASURER';
      await query(`UPDATE users SET role = ? WHERE id = ?`, [primaryRole, userId]);

      await logAction(admin.id, 'UPDATE_USER_ROLES', `Updated roles for user ID ${userId} to [${roles.join(',')}]`);
      return NextResponse.json({ message: 'User roles updated successfully' });

    } else if (action === 'UPDATE_STATUS') {
      const { status, reason } = body;
      
      const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      await query(`UPDATE users SET account_status = ? WHERE id = ?`, [status, userId]);
      await logAction(admin.id, 'UPDATE_USER_STATUS', `Changed status for user ID ${userId} to ${status}. Reason: ${reason || 'N/A'}`);
      
      return NextResponse.json({ message: `User account is now ${status}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
