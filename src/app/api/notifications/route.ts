import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getUserContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  return { supabase, user };
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getUserContext();
    if (!user || !user.email_confirmed_at) return errorResponse('Sign in to view notifications.', 401);

    const unreadOnly = new URL(request.url).searchParams.get('unread') === 'true';
    const query = supabase
      .from('notifications')
      .select('id, user_id, title, body, type, is_read, created_at, actor_id, post_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    const [{ data: notifications, error }, { count, error: countError }] = await Promise.all([
      query,
      supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('is_read', false),
    ]);

    if (error || countError) {
      console.error('Notification query failed:', error?.message ?? countError?.message);
      return errorResponse('Could not load notifications. Apply the latest Supabase migrations and try again.', 500);
    }

    const actorIds = [...new Set((notifications ?? []).flatMap((notification) => notification.actor_id ? [notification.actor_id] : []))];
    const { data: actors, error: actorError } = actorIds.length
      ? await supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', actorIds)
      : { data: [], error: null };
    if (actorError) {
      console.error('Notification actor profile query failed:', actorError.message);
      return errorResponse('Could not load notification profiles.', 500);
    }
    const actorById = new Map((actors ?? []).map((actor) => [actor.id, actor]));

    return NextResponse.json({
      unreadCount: count ?? 0,
      notifications: unreadOnly ? [] : (notifications ?? []).map((notification) => ({
        ...notification,
        actor: notification.actor_id ? actorById.get(notification.actor_id) ?? null : null,
      })),
    });
  } catch (error) {
    console.error('Notification request failed:', error);
    return errorResponse('Could not process your notifications request.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await getUserContext();
    if (!user || !user.email_confirmed_at) return errorResponse('Sign in to update notifications.', 401);

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    if (!payload || typeof payload !== 'object') return errorResponse('Invalid notification update.', 400);
    const ids = (payload as { ids?: unknown }).ids;
    if (ids !== undefined && (!Array.isArray(ids) || ids.some((id) => typeof id !== 'string'))) {
      return errorResponse('Notification ids must be a list of strings.', 400);
    }

    let update = supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    if (Array.isArray(ids)) {
      if (!ids.length) return NextResponse.json({ updated: 0 });
      update = update.in('id', ids);
    }
    const { data, error } = await update.select('id');
    if (error) {
      console.error('Notification read-state update failed:', error.message);
      return errorResponse('Could not mark notifications as read.', 500);
    }
    return NextResponse.json({ updated: data?.length ?? 0 });
  } catch (error) {
    console.error('Notification update request failed:', error);
    return errorResponse('Could not process your notification update.', 500);
  }
}
