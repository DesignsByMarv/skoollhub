import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SkoollHub authentication is not configured. Add the Supabase project URL and anon key to the site environment, then redeploy.');
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(supabaseUrl);
  } catch {
    throw new Error('The Supabase project URL is invalid. Check NEXT_PUBLIC_SUPABASE_URL in the site environment.');
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') {
    throw new Error('The Supabase project URL must use HTTPS.');
  }

  return createBrowserClient(
    parsedUrl.origin,
    supabaseAnonKey
  );
}