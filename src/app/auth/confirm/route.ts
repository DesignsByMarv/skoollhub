import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const emailOtpTypes = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '/dashboard';
  }
  return value;
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNextPath(url.searchParams.get('next'));
  const supabase = await createServerSupabaseClient();
  const code = url.searchParams.get('code');
  let error: Error | null = null;

  if (code) {
    ({ error } = await supabase.auth.exchangeCodeForSession(code));
  } else {
    const tokenHash = url.searchParams.get('token_hash');
    const type = url.searchParams.get('type');

    if (!tokenHash || !type || !emailOtpTypes.has(type as EmailOtpType)) {
      return NextResponse.redirect(new URL('/login?error=verification', request.url));
    }

    ({ error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    }));
  }

  if (error) {
    console.error('Email confirmation failed:', error.message);
    return NextResponse.redirect(new URL('/login?error=verification', request.url));
  }

  return NextResponse.redirect(new URL(next, request.url));
}
