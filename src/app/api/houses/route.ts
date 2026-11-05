import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const houseFields = 'id, owner_id, school_id, title, description, price_per_year, address, area_name, bedrooms, bathrooms, amenities, images, is_available, created_at, room_type, caution_deposit, agency_fee, legal_fee, service_charge, distance_km, walk_minutes, is_featured, is_verified, payment_status';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, user: null };
  return { supabase, user };
}

function parseStringList(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

export async function GET(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to browse campus housing.', 401);
    const mine = new URL(request.url).searchParams.get('mine') === 'true';
    const [{ data: profile, error: profileError }, { data: schoolDirectory, error: schoolsError }] = await Promise.all([
      supabase.from('profiles').select('school_id').eq('id', user.id).maybeSingle(),
      supabase.from('schools').select('id, name, short_name, city, state').order('name').limit(2000),
    ]);
    if (profileError || schoolsError) {
      console.error('Housing search context query failed:', profileError?.message ?? schoolsError?.message);
      return errorResponse('Could not load campus housing data.', 500);
    }

    let query = supabase.from('houses')
      .select(houseFields)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100);
    if (mine) query = query.eq('owner_id', user.id);
    else query = query.eq('is_available', true);
    const schoolFilter = new URL(request.url).searchParams.get('school_id');
    if (!mine && isUuid(schoolFilter)) query = query.eq('school_id', schoolFilter);
    const { data: houses, error } = await query;
    if (error) {
      console.error('Housing listings query failed:', error.message);
      return errorResponse('Could not load housing listings.', 500);
    }

    const schoolIds = [...new Set((houses ?? []).map((house) => house.school_id))];
    const ownerIds = [...new Set((houses ?? []).map((house) => house.owner_id))];
    const [schoolsResult, ownersResult] = await Promise.all([
      schoolIds.length
        ? supabase.from('schools').select('id, name, short_name, city, state').in('id', schoolIds)
        : Promise.resolve({ data: [], error: null }),
      ownerIds.length
        ? supabase.from('profiles').select('id, full_name, username, avatar_url').in('id', ownerIds)
        : Promise.resolve({ data: [], error: null }),
    ]);
    const relatedError = schoolsResult.error ?? ownersResult.error;
    if (relatedError) {
      console.error('Housing listing details query failed:', relatedError.message);
      return errorResponse('Could not load housing listing details.', 500);
    }
    const schools = new Map((schoolsResult.data ?? []).map((school) => [school.id, school]));
    const owners = new Map((ownersResult.data ?? []).map((owner) => [owner.id, owner]));
    return NextResponse.json({
      current_school_id: profile?.school_id ?? null,
      schools: schoolDirectory ?? [],
      houses: (houses ?? []).map((house) => ({
        ...house,
        school: schools.get(house.school_id) ?? null,
        owner: owners.get(house.owner_id) ?? null,
      })),
    });
  } catch (error) {
    console.error('Housing listings request failed:', error);
    return errorResponse('Could not process the housing request.', 500);
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to post a housing listing.', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    if (!body || typeof body !== 'object') return errorResponse('Enter valid listing details.', 400);
    const payload = body as Record<string, unknown>;
    const title = typeof payload.title === 'string' ? payload.title.trim() : '';
    const description = typeof payload.description === 'string' ? payload.description.trim() : '';
    const address = typeof payload.address === 'string' ? payload.address.trim() : '';
    const areaName = typeof payload.area_name === 'string' ? payload.area_name.trim() : '';
    const roomType = typeof payload.room_type === 'string' ? payload.room_type.trim() : '';
    const price = Number(payload.price_per_year);
    const schoolId = payload.school_id;
    const bedrooms = Number(payload.bedrooms);
    const bathrooms = Number(payload.bathrooms);
    if (!title || title.length > 120 || !description || description.length > 3000) {
      return errorResponse('Add a title and a description of no more than 3,000 characters.', 400);
    }
    if (!address || address.length > 240 || !areaName || areaName.length > 100) {
      return errorResponse('Enter the address and campus area.', 400);
    }
    if (!roomType || roomType.length > 60 || !Number.isSafeInteger(price) || price <= 0) {
      return errorResponse('Choose a room type and a valid annual rent in naira.', 400);
    }
    if (!Number.isInteger(bedrooms) || bedrooms < 1 || bedrooms > 30
      || !Number.isInteger(bathrooms) || bathrooms < 1 || bathrooms > 30) {
      return errorResponse('Enter a valid number of bedrooms and bathrooms.', 400);
    }
    if (schoolId !== undefined && !isUuid(schoolId)) return errorResponse('Choose a valid school.', 400);

    const { data: profile, error: profileError } = await supabase
      .from('profiles').select('school_id').eq('id', user.id).maybeSingle();
    if (profileError) {
      console.error('Housing owner profile query failed:', profileError.message);
      return errorResponse('Could not confirm your student profile.', 500);
    }
    const targetSchoolId = typeof schoolId === 'string' ? schoolId : profile?.school_id;
    if (!targetSchoolId) return errorResponse('Select your university in your profile before posting housing.', 400);

    const { data: school, error: schoolError } = await supabase
      .from('schools').select('id').eq('id', targetSchoolId).maybeSingle();
    if (schoolError) {
      console.error('Housing school lookup failed:', schoolError.message);
      return errorResponse('Could not verify the selected school.', 500);
    }
    if (!school) return errorResponse('Choose a school from the directory.', 400);

    const images = parseStringList(payload.images, 6);
    if (images.some((image) => {
      try { return new URL(image).protocol !== 'https:'; } catch { return true; }
    })) {
      return errorResponse('Listing photos must use secure HTTPS links.', 400);
    }
    const amenities = parseStringList(payload.amenities, 20);
    const fee = (value: unknown) => Number.isSafeInteger(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
    const { data: house, error } = await supabase.from('houses')
      .insert({
        owner_id: user.id,
        school_id: targetSchoolId,
        title,
        description,
        address,
        area_name: areaName,
        room_type: roomType,
        price_per_year: price,
        bedrooms,
        bathrooms,
        amenities,
        images,
        caution_deposit: fee(payload.caution_deposit),
        agency_fee: fee(payload.agency_fee),
        legal_fee: fee(payload.legal_fee),
        service_charge: fee(payload.service_charge),
        distance_km: payload.distance_km === '' || payload.distance_km === undefined
          ? null
          : Number(payload.distance_km),
        walk_minutes: payload.walk_minutes === '' || payload.walk_minutes === undefined
          ? null
          : Number(payload.walk_minutes),
        is_available: true,
        payment_status: 'free',
      })
      .select(houseFields)
      .single();
    if (error) {
      console.error('Housing listing creation failed:', error.message);
      return errorResponse('Could not publish the housing listing.', 500);
    }
    return NextResponse.json({ house }, { status: 201 });
  } catch (error) {
    console.error('Housing listing creation request failed:', error);
    return errorResponse('Could not process your housing listing.', 500);
  }
}
