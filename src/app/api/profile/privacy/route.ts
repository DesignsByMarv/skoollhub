import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Please sign in with a confirmed email.' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || typeof (body as Record<string, unknown>).is_discoverable !== 'boolean') {
      return NextResponse.json({ error: 'Choose whether your account can appear in student discovery.' }, { status: 400 });
    }

    const isDiscoverable = (body as { is_discoverable: boolean }).is_discoverable;
    const { error } = await supabase.from('profiles')
      .update({ is_discoverable: isDiscoverable, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) {
      console.error('Student discovery privacy update failed:', error.message);
      return NextResponse.json({ error: 'Could not update your student discovery privacy.' }, { status: 500 });
    }

    return NextResponse.json({ is_discoverable: isDiscoverable });
  } catch (error) {
    console.error('Student discovery privacy request failed:', error);
    return NextResponse.json({ error: 'Could not process this privacy update.' }, { status: 500 });
  }
}
