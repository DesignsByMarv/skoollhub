import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
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
    if (!body || typeof body !== 'object') return errorResponse('Location data is invalid.', 400);
    const { latitude, longitude } = body as Record<string, unknown>;
    if (
      typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90
      || typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180
    ) {
      return errorResponse('Choose a valid location.', 400);
    }

    const { error } = await supabase.from('profiles')
      .update({
        location_latitude: Math.round(latitude * 100) / 100,
        location_longitude: Math.round(longitude * 100) / 100,
        location_sharing_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) {
      console.error('Approximate location update failed:', error.message);
      return errorResponse('Could not save your nearby-discovery preference.', 500);
    }

    return NextResponse.json({ success: true, precision: 'approximately 1 km' });
  } catch (error) {
    console.error('Location update request failed:', error);
    return errorResponse('Could not process your location update.', 500);
  }
}

export async function DELETE() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return errorResponse('Please sign in with a confirmed email.', 401);
    }

    const { error } = await supabase.from('profiles')
      .update({
        location_latitude: null,
        location_longitude: null,
        location_sharing_enabled: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    if (error) {
      console.error('Approximate location removal failed:', error.message);
      return errorResponse('Could not turn off nearby discovery.', 500);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Location removal request failed:', error);
    return errorResponse('Could not process your location request.', 500);
  }
}
