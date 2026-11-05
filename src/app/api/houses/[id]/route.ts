import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const houseFields = 'id, owner_id, school_id, title, description, price_per_year, address, area_name, bedrooms, bathrooms, amenities, images, is_available, created_at, room_type, caution_deposit, agency_fee, legal_fee, service_charge, distance_km, walk_minutes, is_featured, is_verified, payment_status';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, user: null };
  return { supabase, user };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to view housing details.', 401);
    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Choose a valid housing listing.', 400);
    const { data: house, error } = await supabase.from('houses')
      .select(houseFields).eq('id', id).maybeSingle();
    if (error) {
      console.error('Housing detail query failed:', error.message);
      return errorResponse('Could not load this listing.', 500);
    }
    if (!house) return errorResponse('This listing is not available.', 404);
    const [{ data: school, error: schoolError }, { data: owner, error: ownerError }, { data: unlock }] = await Promise.all([
      supabase.from('schools').select('id, name, short_name, city, state').eq('id', house.school_id).maybeSingle(),
      supabase.from('profiles').select('id, full_name, username, avatar_url, phone_number').eq('id', house.owner_id).maybeSingle(),
      supabase.from('housing_contact_unlocks').select('id').eq('house_id', id).eq('user_id', user.id).maybeSingle(),
    ]);
    if (schoolError || ownerError) {
      console.error('Housing detail relationship query failed:', schoolError?.message ?? ownerError?.message);
      return errorResponse('Could not load listing details.', 500);
    }
    const canSeePhone = house.owner_id === user.id || Boolean(unlock);
    return NextResponse.json({
      house: {
        ...house,
        school,
        owner: owner ? {
          id: owner.id,
          full_name: owner.full_name,
          username: owner.username,
          avatar_url: owner.avatar_url,
          phone_number: canSeePhone ? owner.phone_number : null,
        } : null,
        contact_unlocked: canSeePhone,
        is_owner: house.owner_id === user.id,
      },
    });
  } catch (error) {
    console.error('Housing detail request failed:', error);
    return errorResponse('Could not process this listing request.', 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to update a listing.', 401);
    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Choose a valid housing listing.', 400);
    let body: unknown;
    try { body = await request.json(); } catch { return errorResponse('Request body must be valid JSON.', 400); }
    if (!body || typeof body !== 'object') return errorResponse('Enter valid listing updates.', 400);
    const payload = body as Record<string, unknown>;
    const updates: Record<string, unknown> = {};
    if (typeof payload.is_available === 'boolean') updates.is_available = payload.is_available;
    if (typeof payload.title === 'string') {
      const title = payload.title.trim();
      if (!title || title.length > 120) return errorResponse('Listing title must be 1–120 characters.', 400);
      updates.title = title;
    }
    if (!Object.keys(updates).length) return errorResponse('No supported listing updates were provided.', 400);
    const { data: house, error } = await supabase.from('houses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('owner_id', user.id)
      .select('id, is_available, title')
      .maybeSingle();
    if (error) {
      console.error('Housing listing update failed:', error.message);
      return errorResponse('Could not update this listing.', 500);
    }
    if (!house) return errorResponse('Listing not found or you do not own it.', 404);
    return NextResponse.json({ house });
  } catch (error) {
    console.error('Housing listing update request failed:', error);
    return errorResponse('Could not process your listing update.', 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to remove a listing.', 401);
    const { id } = await params;
    if (!isUuid(id)) return errorResponse('Choose a valid housing listing.', 400);
    const { data: deleted, error } = await supabase.from('houses')
      .delete().eq('id', id).eq('owner_id', user.id).select('id').maybeSingle();
    if (error) {
      console.error('Housing listing deletion failed:', error.message);
      return errorResponse('Could not remove this listing.', 500);
    }
    if (!deleted) return errorResponse('Listing not found or you do not own it.', 404);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Housing listing deletion request failed:', error);
    return errorResponse('Could not process your listing deletion.', 500);
  }
}
