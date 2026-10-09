import { NextResponse, type NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        created_at,
        participants:conversation_participants(user_id),
        messages(id, content, media_url, created_at, sender_id)
      `)
      .filter('conversation_participants.user_id', 'eq', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
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

    const body = await request.json() as { participant_ids: string[] };
    const { participant_ids } = body;

    if (!participant_ids || participant_ids.length === 0) {
      return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }

    // Check if conversation already exists with these participants
    const participantSet = new Set([user.id, ...participant_ids]);
    const sortedParticipants = Array.from(participantSet).sort();

    // Create conversation
    const { data: conversation, error: createError } = await supabase
      .from('conversations')
      .insert({ created_at: new Date().toISOString() })
      .select()
      .single();

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Add participants
    const participantRecords = sortedParticipants.map((userId) => ({
      conversation_id: conversation.id,
      user_id: userId,
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantRecords);

    if (participantsError) {
      return NextResponse.json({ error: participantsError.message }, { status: 500 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
