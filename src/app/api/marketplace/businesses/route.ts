import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

// Public route to fetch active businesses (with optional filtering)
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const location = searchParams.get('location');

    let dbQuery = supabase
      .from('businesses')
      .select(`
        *,
        users (first_name, last_name)
      `)
      .eq('status', 'ACTIVE')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (category) {
      dbQuery = dbQuery.eq('category', category);
    }
    if (location) {
      dbQuery = dbQuery.ilike('location', `%${location}%`);
    }
    
    const { data: businessesData, error } = await dbQuery;
    
    if (error) throw error;
    
    const businesses = businessesData?.map((b: any) => ({
      ...b,
      first_name: b.users?.first_name,
      last_name: b.users?.last_name
    })) || [];
    
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
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
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

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        owner_id: user.id,
        business_name,
        category,
        description,
        location,
        website_url: website_url || null,
        whatsapp_number,
        offers_alumni_discount: offers_alumni_discount ? 1 : 0,
        discount_details: discount_details || null
      })
      .select('id')
      .single();
      
    if (error) throw error;

    return NextResponse.json({ message: 'Business submitted for review', id: data.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
