import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const profileColumns = 'id, email, full_name, username, avatar_url, school_id, department, level, bio, phone_number, is_verified, created_at';

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

async function getUserContext() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw new Error(`Could not verify your session: ${error.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, user: null };
  return { supabase, user };
}

export async function GET() {
  try {
    const { supabase, user } = await getUserContext();
    if (!user) return errorResponse('Please sign in with a confirmed email to view your profile.', 401);

    const [{ data: profile, error: profileError }, { data: schools, error: schoolsError }] = await Promise.all([
      supabase.from('profiles').select(profileColumns).eq('id', user.id).maybeSingle(),
      supabase.from('schools').select('id, name, short_name, city, state').order('name').limit(500),
    ]);
    if (profileError) {
      console.error('Profile query failed:', profileError.message);
      return errorResponse('Could not load your profile.', 500);
    }
    if (schoolsError) {
      console.error('School directory query failed:', schoolsError.message);
      return errorResponse('Could not load the school directory.', 500);
    }
    if (!profile) {
      return errorResponse('Your student profile has not been set up yet. Please contact support.', 404);
    }

    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, content, category, media_urls, media_type, likes_count, comments_count, created_at')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);
    if (postsError) {
      console.error('Profile posts query failed:', postsError.message);
      return errorResponse('Could not load your recent posts.', 500);
    }

    return NextResponse.json({
      profile: {
        ...profile,
        email: user.email ?? profile.email,
        school: schools?.find((school) => school.id === profile.school_id) ?? null,
      },
      schools: schools ?? [],
      posts: posts ?? [],
    });
  } catch (error) {
    console.error('Profile request failed:', error);
    return errorResponse('Could not process your profile request.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, user } = await getUserContext();
    if (!user) return errorResponse('Please sign in with a confirmed email to update your profile.', 401);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }
    if (!body || typeof body !== 'object') return errorResponse('Invalid profile update.', 400);
    const payload = body as Record<string, unknown>;

    const fullName = typeof payload.full_name === 'string' ? payload.full_name.trim() : '';
    const username = typeof payload.username === 'string' ? payload.username.trim().toLowerCase() : '';
    const avatarUrl = typeof payload.avatar_url === 'string' ? payload.avatar_url.trim() : null;
    const department = typeof payload.department === 'string' ? payload.department.trim() : '';
    const phoneNumber = typeof payload.phone_number === 'string' ? payload.phone_number.trim() : '';
    const bio = typeof payload.bio === 'string' ? payload.bio.trim() : '';
    const level = payload.level === null ? null : payload.level;
    const schoolId = payload.school_id === null ? null : payload.school_id;

    if (!fullName || fullName.length > 100) return errorResponse('Enter a name up to 100 characters.', 400);
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      return errorResponse('Username must be 3–24 characters using lowercase letters, numbers, or underscores.', 400);
    }
    if (department.length > 100) return errorResponse('Department must be 100 characters or fewer.', 400);
    if (phoneNumber.length > 30) return errorResponse('Phone number must be 30 characters or fewer.', 400);
    if (bio.length > 500) return errorResponse('Bio must be 500 characters or fewer.', 400);
    if (level !== null && (!Number.isInteger(level) || (level as number) < 100 || (level as number) > 900)) {
      return errorResponse('Choose a valid academic level.', 400);
    }
    if (schoolId !== null && !isUuid(schoolId)) return errorResponse('Choose a valid school.', 400);

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        username,
        avatar_url: avatarUrl,
        department: department || null,
        phone_number: phoneNumber || null,
        bio: bio || null,
        level,
        school_id: schoolId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select(profileColumns)
      .single();

    if (error) {
      console.error('Profile update failed:', error.message);
      if (error.code === '23505') return errorResponse('That username is already in use.', 409);
      return errorResponse('Could not save your profile. Please try again.', 500);
    }

    return NextResponse.json({ profile: { ...profile, email: user.email ?? profile.email } });
  } catch (error) {
    console.error('Profile update request failed:', error);
    return errorResponse('Could not process your profile update.', 500);
  }
}
