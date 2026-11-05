import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Handle call initiation (POST)
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { chatId, recipientId } = body;

    return NextResponse.json({ 
      success: true, 
      sessionId: `call_${Date.now()}`,
      message: 'Call signaling prepared successfully' 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Handle call status fetching / polling (GET)
export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chatId = searchParams.get('chat_id');

    return NextResponse.json({ 
      success: true, 
      chatId,
      status: 'ringing',
      signalingData: null 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}