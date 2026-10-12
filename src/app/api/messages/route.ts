import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const messageFields = 'id, chat_id, sender_id, content, media_url, message_type, document_name, created_at';
const messageTypes = new Set(['text', 'image', 'video', 'audio', 'document']);

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, user: null };
  return { supabase, user };
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Please sign in with a confirmed email.', 401);
    const chatId = new URL(request.url).searchParams.get('chat_id');
    if (!isUuid(chatId)) return errorResponse('Choose a valid conversation.', 400);

    const { data: membership, error: membershipError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (membershipError) {
      console.error('Chat membership query failed:', membershipError.message);
      return errorResponse('Could not load this conversation.', 500);
    }
    if (!membership) return errorResponse('You are not a participant in this conversation.', 403);

    const { data: messages, error } = await supabase
      .from('messages')
      .select(messageFields)
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(500);
    if (error) {
      console.error('Message history query failed:', error.message);
      return errorResponse('Could not load message history.', 500);
    }

    return NextResponse.json({ messages: messages ?? [] });
  } catch (error) {
    console.error('Message history request failed:', error);
    return errorResponse('Could not process your message history request.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Please sign in with a confirmed email.', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    if (!body || typeof body !== 'object') return errorResponse('Invalid message.', 400);

    const payload = body as Record<string, unknown>;
    const chatId = payload.chat_id;
    const content = typeof payload.content === 'string' ? payload.content.trim() : '';
    const mediaUrl = typeof payload.media_url === 'string' ? payload.media_url : null;
    const messageType = typeof payload.message_type === 'string' ? payload.message_type : 'text';
    const documentName = typeof payload.document_name === 'string' ? payload.document_name.trim().slice(0, 255) : null;

    if (!isUuid(chatId)) return errorResponse('Choose a valid conversation.', 400);
    if (!messageTypes.has(messageType)) return errorResponse('Unsupported message type.', 400);
    if (content.length > 5000) return errorResponse('Messages must be 5,000 characters or fewer.', 400);
    if (!content && !mediaUrl) return errorResponse('Write a message or attach a file.', 400);
    if (mediaUrl) {
      try {
        const parsedUrl = new URL(mediaUrl);
        if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
          return errorResponse('Attachment URL is invalid.', 400);
        }
      } catch {
        return errorResponse('Attachment URL is invalid.', 400);
      }
    }

    const { data: membership, error: membershipError } = await supabase
      .from('chat_participants')
      .select('chat_id')
      .eq('chat_id', chatId)
      .eq('user_id', user.id)
      .maybeSingle();
    if (membershipError) {
      console.error('Chat membership query failed:', membershipError.message);
      return errorResponse('Could not send this message.', 500);
    }
    if (!membership) return errorResponse('You are not a participant in this conversation.', 403);

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content: content || null,
        media_url: mediaUrl,
        message_type: messageType,
        document_name: documentName,
      })
      .select(messageFields)
      .single();
    if (error) {
      console.error('Message send failed:', error.message);
      return errorResponse('Could not send your message. Please try again.', 500);
    }

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error('Message send request failed:', error);
    return errorResponse('Could not process your message.', 500);
  }
}
