import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { logAction } from '@/lib/audit';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });

    const { data: dbUser } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (!dbUser || dbUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Super Admin access required.' }, { status: 401 });
    }

    const { id: userId } = await params;
    if (user.id && user.id.toString() === userId.toString()) {
      return NextResponse.json({ error: 'You cannot modify your own Super Admin account.' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body; // action can be 'UPDATE_ROLES' or 'UPDATE_STATUS'

    if (action === 'UPDATE_ROLES') {
      const { roles } = body; // Array of role IDs
      
      // Clear existing roles
      await supabase.from('user_roles').delete().eq('user_id', userId);
      
      // Insert new roles
      if (roles && roles.length > 0) {
        const rolesToInsert = roles.map((roleId: number) => ({ user_id: userId, role_id: roleId }));
        await supabase.from('user_roles').insert(rolesToInsert);
      }

      // Legacy sync
      let primaryRole = 'MEMBER';
      if (roles.includes(1)) primaryRole = 'SUPER_ADMIN';
      else if (roles.includes(2)) primaryRole = 'ADMIN';
      else if (roles.includes(3)) primaryRole = 'TREASURER';
      await supabase.from('users').update({ role: primaryRole }).eq('id', userId);

      await logAction(user.id, 'UPDATE_USER_ROLES', `Updated roles for user ID ${userId} to [${roles.join(',')}]`);
      return NextResponse.json({ message: 'User roles updated successfully' });

    } else if (action === 'UPDATE_STATUS') {
      const { status, reason } = body;
      
      const validStatuses = ['ACTIVE', 'SUSPENDED', 'BANNED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      await supabase.from('users').update({ account_status: status }).eq('id', userId);
      await logAction(user.id, 'UPDATE_USER_STATUS', `Changed status for user ID ${userId} to ${status}. Reason: ${reason || 'N/A'}`);
      
      return NextResponse.json({ message: `User account is now ${status}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
