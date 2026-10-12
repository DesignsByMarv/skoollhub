import { connection, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function isMissingFunction(error: { code?: string } | null) {
  return error?.code === '42883' || error?.code === 'PGRST202';
}

export async function GET() {
  await connection();
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Please sign in with a confirmed email.' }, { status: 401 });
    }

    const { data: result, error } = await supabase.rpc('get_unread_message_counts');
    if (error) {
      if (isMissingFunction(error)) return NextResponse.json({ unreadCount: 0 });
      console.error('Unread message count query failed:', error.message);
      return NextResponse.json({ error: 'Could not load unread message counts.' }, { status: 500 });
    }

    const data = result as Array<{ unread_count: number | string }> | null;
    const unreadCount = (data ?? []).reduce((total, item) => total + Number(item.unread_count), 0);
    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error('Unread message count request failed:', error);
    return NextResponse.json({ error: 'Could not process unread message count request.' }, { status: 500 });
  }
}
