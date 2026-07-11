import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Public route to fetch active businesses (with optional filtering)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    let sql = `
      SELECT b.*, u.first_name, u.last_name 
      FROM businesses b
      JOIN users u ON b.owner_id = u.id
      WHERE b.status = 'ACTIVE'
    `;
    const params: any[] = [];

    if (category) {
      sql += ` AND b.category = ?`;
      params.push(category);
    }
    if (location) {
      sql += ` AND b.location LIKE ?`;
      params.push(`%${location}%`);
    }

    // Sort by featured first, then newest
    sql += ` ORDER BY b.is_featured DESC, b.created_at DESC`;
    
    const businesses = await query(sql, params);
    
    // Optionally check if user is logged in to return full discount details vs generic badge
    // But for simplicity, we'll let frontend handle hiding the exact discount code if we add one.
    // Right now discount_details is just the public offer description.
    
    return NextResponse.json({ businesses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Protected route to list a new business
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { 
      business_name, 
      category, 
      description, 
      location, 
      website_url, 
      whatsapp_number, 
      offers_alumni_discount, 
      discount_details 
    } = body;

    // Validation
    if (!business_name || !category || !description || !location || !whatsapp_number) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const insertResult: any = await query(
      `INSERT INTO businesses (owner_id, business_name, category, description, location, website_url, whatsapp_number, offers_alumni_discount, discount_details) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id, 
        business_name, 
        category, 
        description, 
        location, 
        website_url || null, 
        whatsapp_number, 
        offers_alumni_discount ? 1 : 0, 
        discount_details || null
      ]
    );

    return NextResponse.json({ message: 'Business submitted for review', id: insertResult.insertId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
