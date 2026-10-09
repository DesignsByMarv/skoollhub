import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname.startsWith('/feed') ||
                          request.nextUrl.pathname.startsWith('/messages') ||
                          request.nextUrl.pathname.startsWith('/ai-assistant') ||
                          request.nextUrl.pathname.startsWith('/houses') ||
                          request.nextUrl.pathname.startsWith('/roommates') ||
                          request.nextUrl.pathname.startsWith('/timetable') ||
                          request.nextUrl.pathname.startsWith('/settings') ||
                          request.nextUrl.pathname.startsWith('/profile');

  // Block access if user is not logged in OR email is not confirmed
  if (isProtectedPath) {
    if (!user || !user.email_confirmed_at) {
      return NextResponse.redirect(new URL('/login?error=unverified', request.url));
    }
  }

  return response;
}