import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                request.cookies.set(name, value)
              );
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    const { data: authData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && authData?.session) {
      const user = authData.session.user;
      
      // Check if user already exists in public.users
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!existingUser) {
        // Parse Google name metadata
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const nameParts = fullName.split(' ');
        const firstName = user.user_metadata?.firstName || nameParts[0] || 'Alumni';
        const lastName = user.user_metadata?.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Member');
        
        // Insert missing profile
        await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          role: 'MEMBER',
          class_year: null,
          profession: null,
          phone: null
        });

        // Redirect to onboarding so they can fill out Class Year, Profession, etc.
        return NextResponse.redirect(`${origin}/dashboard/onboarding`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
