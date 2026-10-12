import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return errorResponse('Please sign in with a confirmed email.', 401);
    }

    const { data: memberships, error: membershipError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('user_id', user.id);
    if (membershipError) {
      console.error('Conversation membership query failed:', membershipError.message);
      return errorResponse('Could not load conversations.', 500);
    }
    const chatIds = [...new Set((memberships ?? []).map((item) => item.chat_id))];
    if (chatIds.length === 0) return NextResponse.json({ conversations: [] });

    const [participantsResult, messagesResult] = await Promise.all([
      supabase.from('chat_participants').select('chat_id, user_id').in('chat_id', chatIds),
      supabase.from('messages')
        .select('id, chat_id, content, media_url, message_type, created_at, sender_id')
        .in('chat_id', chatIds)
        .order('created_at', { ascending: false })
        .limit(500),
    ]);
    const queryError = participantsResult.error ?? messagesResult.error;
    if (queryError) {
      console.error('Conversation details query failed:', queryError.message);
      return errorResponse('Could not load conversations.', 500);
    }

    const participantIds = [...new Set((participantsResult.data ?? [])
      .filter((item) => item.user_id !== user.id)
      .map((item) => item.user_id))];
    const { data: profiles, error: profilesError } = participantIds.length
      ? await supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', participantIds)
      : { data: [], error: null };
    if (profilesError) {
      console.error('Conversation profile query failed:', profilesError.message);
      return errorResponse('Could not load conversation profiles.', 500);
    }

    const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
    const lastMessageByChat = new Map<string, (typeof messagesResult.data)[number]>();
    for (const message of messagesResult.data ?? []) {
      if (!lastMessageByChat.has(message.chat_id)) lastMessageByChat.set(message.chat_id, message);
    }
    const conversations = chatIds.map((chatId) => {
      const otherUserId = (participantsResult.data ?? []).find(
        (item) => item.chat_id === chatId && item.user_id !== user.id
      )?.user_id;
      return {
        id: chatId,
        contact: otherUserId ? profileById.get(otherUserId) ?? null : null,
        last_message: lastMessageByChat.get(chatId) ?? null,
      };
    }).filter((conversation) => conversation.contact)
      .sort((a, b) => {
        const aTime = a.last_message?.created_at ?? '';
        const bTime = b.last_message?.created_at ?? '';
        return bTime.localeCompare(aTime);
      });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Conversations request failed:', error);
    return errorResponse('Could not process your conversations request.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return errorResponse('Please sign in with a confirmed email.', 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    const participantIds = body && typeof body === 'object'
      ? (body as Record<string, unknown>).participant_ids
      : null;
    if (!Array.isArray(participantIds) || participantIds.length !== 1 || !isUuid(participantIds[0])) {
      return errorResponse('Choose one valid student to message.', 400);
    }
    if (participantIds[0] === user.id) return errorResponse('You cannot message yourself.', 400);

    const { data: chatId, error } = await supabase.rpc('create_direct_chat', {
      other_user_id: participantIds[0],
    });
    if (error || !chatId) {
      console.error('Direct chat creation failed:', error?.message);
      return errorResponse('Could not start this conversation. Apply the latest database migration and try again.', 500);
    }

    return NextResponse.json({ conversation: { id: chatId } }, { status: 200 });
  } catch (error) {
    console.error('Conversation creation request failed:', error);
    return errorResponse('Could not process your conversation request.', 500);
  }
}
