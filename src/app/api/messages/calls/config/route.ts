import { createHmac } from 'node:crypto';
import { connection, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  await connection();
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Please sign in with a confirmed email.' }, { status: 401 });
    }

    const urls = (process.env.TURN_SERVER_URLS ?? '')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    if (!urls.length) return NextResponse.json({ iceServers: [], relayConfigured: false });

    const sharedSecret = process.env.TURN_SHARED_SECRET;
    if (!sharedSecret) {
      console.error('TURN_SERVER_URLS is set but TURN_SHARED_SECRET is missing.');
      return NextResponse.json({ error: 'Voice-call relay is not configured correctly.' }, { status: 503 });
    }
    if (urls.some((url) => !/^turns?:[^,\s]+$/i.test(url))) {
      console.error('A TURN_SERVER_URLS entry is invalid.');
      return NextResponse.json({ error: 'Voice-call relay configuration is invalid.' }, { status: 500 });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60;
    const username = `${expiresAt}:${user.id}`;
    const credential = createHmac('sha1', sharedSecret).update(username).digest('base64');
    return NextResponse.json({
      iceServers: [{ urls, username, credential }],
      relayConfigured: true,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    console.error('Voice-call relay configuration request failed:', error);
    return NextResponse.json({ error: 'Could not load voice-call relay configuration.' }, { status: 500 });
  }
}
