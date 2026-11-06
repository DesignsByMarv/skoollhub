import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    return NextResponse.next({ request });
  }

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
  const pathname = request.nextUrl.pathname;
  const redirectWithSession = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  };

  if (user?.email_confirmed_at && pathname === '/login') {
    return redirectWithSession(new URL('/feed', request.url));
  }

  const isProtectedPath = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/feed') ||
                          pathname.startsWith('/messages') ||
                          pathname.startsWith('/notifications') ||
                          pathname.startsWith('/subscriptions') ||
                          pathname.startsWith('/ai-assistant') ||
                          pathname.startsWith('/houses') ||
                          pathname.startsWith('/roommates') ||
                          pathname.startsWith('/timetable') ||
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/profile');

  // Block access if user is not logged in OR email is not confirmed
  if (isProtectedPath) {
    if (!user || !user.email_confirmed_at) {
      return redirectWithSession(new URL('/login?error=unverified', request.url));
    }
  }

  return response;
}