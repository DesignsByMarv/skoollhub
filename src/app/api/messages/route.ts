import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = request.nextUrl.searchParams.get('conversation_id');
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });
    }

    // Get messages from conversation
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        content,
        media_url,
        media_type,
        document_url,
        document_name,
        call_type,
        call_duration,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as {
      conversation_id: string;
      content?: string;
      media_url?: string;
      media_type?: string;
      document_url?: string;
      document_name?: string;
      call_type?: 'voice' | 'video';
      call_duration?: number;
    };

    const { conversation_id, content, media_url, media_type, document_url, document_name, call_type, call_duration } = body;

    if (!conversation_id) {
      return NextResponse.json({ error: 'Missing conversation_id' }, { status: 400 });
    }

    if (!content && !media_url && !document_url && !call_type) {
      return NextResponse.json({ error: 'Message must have content, media, document, or call info' }, { status: 400 });
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content: content || null,
        media_url: media_url || null,
        media_type: media_type || null,
        document_url: document_url || null,
        document_name: document_name || null,
        call_type: call_type || null,
        call_duration: call_duration || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}
