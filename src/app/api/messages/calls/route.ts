import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const validSignalTypes = new Set(['offer', 'answer', 'ice-candidate', 'reject', 'hangup']);

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getSignedInUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, user: null };
  return { supabase, user };
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getSignedInUser();
    if (!user) return errorResponse('Please sign in with a confirmed email.', 401);
    const chatId = new URL(request.url).searchParams.get('chat_id');
    if (!isUuid(chatId)) return errorResponse('Choose a valid conversation.', 400);

    const { data: membership, error: membershipError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (membershipError || !membership) {
      if (membershipError) console.error('Voice call membership lookup failed:', membershipError.message);
      return errorResponse('You are not a participant in this conversation.', 403);
    }

    const { data: signals, error } = await supabase.from('call_signals')
      .select('id, chat_id, sender_id, recipient_id, signal_type, payload, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Voice call signal query failed:', error.message);
      return errorResponse('Could not load call invitations.', 500);
    }

    return NextResponse.json({ signals: (signals ?? []).reverse() });
  } catch (error) {
    console.error('Voice call signal request failed:', error);
    return errorResponse('Could not process the call request.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getSignedInUser();
    if (!user) return errorResponse('Please sign in with a confirmed email.', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    if (!body || typeof body !== 'object') return errorResponse('Invalid call signal.', 400);

    const payload = body as Record<string, unknown>;
    const chatId = payload.chat_id;
    const recipientId = payload.recipient_id;
    const signalType = payload.signal_type;
    const signalPayload = payload.payload ?? null;
    if (!isUuid(chatId) || !isUuid(recipientId) || recipientId === user.id) {
      return errorResponse('Choose a valid conversation participant.', 400);
    }
    if (typeof signalType !== 'string' || !validSignalTypes.has(signalType)) {
      return errorResponse('Unsupported voice call signal.', 400);
    }
    if (signalPayload !== null && (typeof signalPayload !== 'object' || Array.isArray(signalPayload))) {
      return errorResponse('Call signal payload is invalid.', 400);
    }
    if (JSON.stringify(signalPayload ?? {}).length > 1_000_000) {
      return errorResponse('Call signal is too large.', 413);
    }

    const { data: participants, error: participantError } = await supabase
      .from('chat_participants')
      .select('user_id')
      .eq('chat_id', chatId)
      .in('user_id', [user.id, recipientId]);
    if (participantError || participants?.length !== 2) {
      if (participantError) console.error('Voice call participant query failed:', participantError.message);
      return errorResponse('Both callers must be participants in this conversation.', 403);
    }

    const { error: cleanupError } = await supabase.from('call_signals')
      .delete()
      .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    if (cleanupError) {
      console.error('Expired voice call signal cleanup failed:', cleanupError.message);
      return errorResponse('Could not prepare voice-call signaling.', 500);
    }

    const { data: signal, error } = await supabase.from('call_signals')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        recipient_id: recipientId,
        signal_type: signalType,
        payload: signalPayload,
      })
      .select('id, chat_id, sender_id, recipient_id, signal_type, payload, created_at')
      .single();
    if (error) {
      console.error('Voice call signal insert failed:', error.message);
      return errorResponse('Could not send the voice call signal.', 500);
    }

    return NextResponse.json({ signal }, { status: 201 });
  } catch (error) {
    console.error('Voice call signal request failed:', error);
    return errorResponse('Could not process the call signal.', 500);
  }
}
