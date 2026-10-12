import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const profileFields = 'id, full_name, username, avatar_url, bio, department, level, school_id, created_at';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function distanceInKilometers(
  latitude: number,
  longitude: number,
  otherLatitude: number,
  otherLongitude: number
) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const deltaLatitude = radians(otherLatitude - latitude);
  const deltaLongitude = radians(otherLongitude - longitude);
  const a = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(radians(latitude)) * Math.cos(radians(otherLatitude)) * Math.sin(deltaLongitude / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user || !user.email_confirmed_at) {
      return errorResponse('Please sign in with a confirmed email.', 401);
    }

    const url = new URL(request.url);
    const username = url.searchParams.get('username')?.trim().replace(/^@/, '');
    if (username) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(profileFields)
        .eq('username', username.toLowerCase())
        .maybeSingle();
      if (profileError) {
        console.error('Public profile query failed:', profileError.message);
        return errorResponse('Could not load this profile.', 500);
      }
      if (!profile) return errorResponse('This profile could not be found.', 404);

      const [postsResult, followersResult, followingResult, followedResult, schoolsResult] = await Promise.all([
        supabase.from('posts')
          .select('id, content, category, media_urls, media_type, likes_count, comments_count, created_at', { count: 'exact' })
          .eq('author_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(60),
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', profile.id),
        supabase.from('follows').select('following_id', { count: 'exact', head: true }).eq('follower_id', profile.id),
        supabase.from('follows').select('follower_id').eq('follower_id', user.id).eq('following_id', profile.id).maybeSingle(),
        profile.school_id
          ? supabase.from('schools').select('name, city, state').eq('id', profile.school_id).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);
      const queryError = postsResult.error ?? followersResult.error ?? followingResult.error
        ?? followedResult.error ?? schoolsResult.error;
      if (queryError) {
        console.error('Public profile details query failed:', queryError.message);
        return errorResponse('Could not load this profile.', 500);
      }

      return NextResponse.json({
        profile: {
          ...profile,
          school: schoolsResult.data,
          followers_count: followersResult.count ?? 0,
          following_count: followingResult.count ?? 0,
          posts_count: postsResult.count ?? 0,
          is_following: Boolean(followedResult.data),
          is_own_profile: profile.id === user.id,
        },
        posts: postsResult.data ?? [],
      });
    }

    const search = url.searchParams.get('search')?.trim().replace(/^@/, '').slice(0, 40);
    if (search) {
      const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
      const [usernameMatches, nameMatches] = await Promise.all([
        supabase.from('profiles')
          .select('id, full_name, username, avatar_url, department')
          .neq('id', user.id)
          .eq('is_discoverable', true)
          .ilike('username', pattern)
          .limit(12),
        supabase.from('profiles')
          .select('id, full_name, username, avatar_url, department')
          .neq('id', user.id)
          .eq('is_discoverable', true)
          .ilike('full_name', pattern)
          .limit(12),
      ]);
      const searchError = usernameMatches.error ?? nameMatches.error;
      if (searchError) {
        console.error('Student search failed:', searchError.message);
        return errorResponse('Could not search for students.', 500);
      }
      const suggestions = new Map([
        ...(usernameMatches.data ?? []),
        ...(nameMatches.data ?? []),
      ].map((profile) => [profile.id, profile]));
      return NextResponse.json({ suggestions: [...suggestions.values()].slice(0, 12) });
    }

    const [{ data: followed, error: followedError }, { data: currentProfile, error: currentProfileError }] = await Promise.all([
      supabase.from('follows').select('following_id').eq('follower_id', user.id),
      supabase.from('profiles')
        .select('school_id, location_latitude, location_longitude, location_sharing_enabled')
        .eq('id', user.id)
        .maybeSingle(),
    ]);
    const setupError = followedError ?? currentProfileError;
    if (setupError) {
      console.error('Follow suggestions context query failed:', setupError.message);
      return errorResponse('Could not load follow suggestions.', 500);
    }

    const excludedIds = [user.id, ...(followed ?? []).map((item) => item.following_id)];
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url, department, school_id, location_latitude, location_longitude, location_sharing_enabled, created_at')
      .not('id', 'in', `(${excludedIds.join(',')})`)
      .eq('is_discoverable', true)
      .order('created_at', { ascending: false })
      .limit(500);
    if (suggestionsError) {
      console.error('Follow suggestions query failed:', suggestionsError.message);
      return errorResponse('Could not load follow suggestions.', 500);
    }

    const latitude = currentProfile?.location_sharing_enabled ? currentProfile.location_latitude : null;
    const longitude = currentProfile?.location_sharing_enabled ? currentProfile.location_longitude : null;
    const rankedSuggestions = (suggestions ?? []).map((candidate) => {
      const isSameSchool = Boolean(currentProfile?.school_id && candidate.school_id === currentProfile.school_id);
      const hasLocation = latitude !== null && longitude !== null
        && candidate.location_sharing_enabled
        && candidate.location_latitude !== null
        && candidate.location_longitude !== null;
      const distance = hasLocation
        ? distanceInKilometers(latitude, longitude, candidate.location_latitude, candidate.location_longitude)
        : Number.POSITIVE_INFINITY;
      return {
        profile: candidate,
        score: isSameSchool ? distance / 1000 : 100 + distance,
      };
    })
      .sort((a, b) => a.score - b.score || a.profile.full_name.localeCompare(b.profile.full_name))
      .slice(0, 8)
      .map(({ profile }) => ({
        id: profile.id,
        full_name: profile.full_name,
        username: profile.username,
        avatar_url: profile.avatar_url,
        department: profile.department,
        same_school: Boolean(currentProfile?.school_id && profile.school_id === currentProfile.school_id),
      }));

    return NextResponse.json({
      suggestions: rankedSuggestions,
      nearby_enabled: Boolean(latitude !== null && longitude !== null),
    });
  } catch (error) {
    console.error('Social request failed:', error);
    return errorResponse('Could not process your social request.', 500);
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
    if (!body || typeof body !== 'object') return errorResponse('Invalid follow request.', 400);
    const targetId = (body as Record<string, unknown>).userId;
    if (typeof targetId !== 'string' || !/^[0-9a-f-]{36}$/i.test(targetId) || targetId === user.id) {
      return errorResponse('Choose a valid student to follow.', 400);
    }

    const { data: existing, error: lookupError } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('follower_id', user.id)
      .eq('following_id', targetId)
      .maybeSingle();
    if (lookupError) {
      console.error('Follow lookup failed:', lookupError.message);
      return errorResponse('Could not update this follow.', 500);
    }

    if (existing) {
      const { error } = await supabase.from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetId);
      if (error) {
        console.error('Unfollow failed:', error.message);
        return errorResponse('Could not unfollow this student.', 500);
      }
      return NextResponse.json({ isFollowing: false });
    }

    const { error } = await supabase.from('follows')
      .insert({ follower_id: user.id, following_id: targetId });
    if (error) {
      console.error('Follow failed:', error.message);
      return errorResponse('Could not follow this student.', 500);
    }
    return NextResponse.json({ isFollowing: true });
  } catch (error) {
    console.error('Follow update failed:', error);
    return errorResponse('Could not update this follow.', 500);
  }
}
