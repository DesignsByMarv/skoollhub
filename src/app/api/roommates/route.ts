import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const genders = new Set(['male', 'female', 'prefer_not_to_say']);
const genderPreferences = new Set(['any', 'male', 'female']);
const lifestyleKeys = ['study_habit', 'cleanliness', 'social_style'] as const;

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

export async function GET() {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to find roommate matches.', 401);

    const [{ data: currentProfile, error: profileError }, { data: current, error: currentError }] = await Promise.all([
      supabase.from('profiles').select('school_id, level, department').eq('id', user.id).maybeSingle(),
      supabase.from('roommate_profiles').select('*').eq('student_id', user.id).maybeSingle(),
    ]);
    if (profileError || currentError) {
      console.error('Roommate search profile query failed:', profileError?.message ?? currentError?.message);
      return errorResponse('Could not load roommate preferences.', 500);
    }

    const { data: profiles, error: profilesError } = await supabase.from('roommate_profiles')
      .select('id, student_id, school_id, budget_max, preferred_location, lifestyle_habits, bio, is_active, gender, gender_preference, budget_share, study_habit, cleanliness, social_style, smokes, cooks, contact_enabled')
      .eq('is_active', true)
      .neq('student_id', user.id)
      .limit(200);
    if (profilesError) {
      console.error('Roommate profiles query failed:', profilesError.message);
      return errorResponse('Could not search roommate profiles.', 500);
    }

    const candidateIds = [...new Set((profiles ?? []).map((profile) => profile.student_id))];
    const [peopleResult, schoolsResult] = await Promise.all([
      candidateIds.length
        ? supabase.from('profiles').select('id, full_name, username, avatar_url, school_id, department, level').in('id', candidateIds)
        : Promise.resolve({ data: [], error: null }),
      supabase.from('schools').select('id, name, short_name').order('name').limit(2000),
    ]);
    if (peopleResult.error || schoolsResult.error) {
      console.error('Roommate results details query failed:', peopleResult.error?.message ?? schoolsResult.error?.message);
      return errorResponse('Could not load roommate match details.', 500);
    }

    const people = new Map((peopleResult.data ?? []).map((person) => [person.id, person]));
    const schools = new Map((schoolsResult.data ?? []).map((school) => [school.id, school]));
    const answers = (current?.lifestyle_habits && typeof current.lifestyle_habits === 'object')
      ? current.lifestyle_habits as Record<string, unknown>
      : {};
    const ownBudget = Number(current?.budget_share ?? current?.budget_max ?? 0);
    const matches = (profiles ?? []).flatMap((roommate) => {
      const person = people.get(roommate.student_id);
      if (!person) return [];
      if (current?.gender_preference && current.gender_preference !== 'any' && roommate.gender && roommate.gender !== current.gender_preference) return [];
      if (roommate.gender_preference && roommate.gender_preference !== 'any'
        && current?.gender && current.gender !== 'prefer_not_to_say' && roommate.gender_preference !== current.gender) return [];
      const sameSchool = Boolean(currentProfile?.school_id && roommate.school_id === currentProfile.school_id);
      const budget = Number(roommate.budget_share ?? roommate.budget_max ?? 0);
      const budgetSimilarity = ownBudget > 0 && budget > 0
        ? Math.max(0, 1 - Math.abs(ownBudget - budget) / Math.max(ownBudget, budget))
        : 0.5;
      const sameLifestyle = lifestyleKeys.filter((key) => {
        const own = typeof current?.[key] === 'string' ? current[key] : answers[key];
        const other = typeof roommate[key] === 'string' ? roommate[key] : roommate.lifestyle_habits?.[key];
        return Boolean(own && other && own === other);
      }).length;
      const score = Math.round(Math.min(99, 34 + (sameSchool ? 28 : 0) + budgetSimilarity * 22 + sameLifestyle / lifestyleKeys.length * 15));
      return [{
        id: roommate.id,
        student_id: roommate.student_id,
        full_name: person.full_name,
        username: person.username,
        avatar_url: person.avatar_url,
        department: person.department,
        level: person.level,
        school: schools.get(roommate.school_id) ?? null,
        budget_share: budget,
        preferred_location: roommate.preferred_location,
        study_habit: roommate.study_habit ?? roommate.lifestyle_habits?.study_habit ?? null,
        cleanliness: roommate.cleanliness ?? roommate.lifestyle_habits?.cleanliness ?? null,
        social_style: roommate.social_style ?? roommate.lifestyle_habits?.social_style ?? null,
        bio: roommate.bio,
        gender: roommate.gender,
        cooks: roommate.cooks,
        smokes: roommate.smokes,
        contact_enabled: roommate.contact_enabled,
        match_score: score,
        same_school: sameSchool,
      }];
    }).sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      current: current ? {
        ...current,
        school: schools.get(current.school_id) ?? null,
      } : null,
      profile: currentProfile ?? null,
      schools: schoolsResult.data ?? [],
      matches,
    });
  } catch (error) {
    console.error('Roommate request failed:', error);
    return errorResponse('Could not process your roommate request.', 500);
  }
}

export async function PUT(request: Request) {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to create your roommate profile.', 401);
    let body: unknown;
    try { body = await request.json(); } catch { return errorResponse('Request body must be valid JSON.', 400); }
    if (!body || typeof body !== 'object') return errorResponse('Enter valid roommate preferences.', 400);
    const payload = body as Record<string, unknown>;
    if (payload.is_active === false) {
      const { error } = await supabase.from('roommate_profiles').update({ is_active: false }).eq('student_id', user.id);
      if (error) {
        console.error('Roommate profile deactivation failed:', error.message);
        return errorResponse('Could not hide your roommate profile.', 500);
      }
      return NextResponse.json({ success: true, is_active: false });
    }

    const { data: profile, error: profileError } = await supabase.from('profiles')
      .select('school_id').eq('id', user.id).maybeSingle();
    if (profileError) {
      console.error('Roommate profile school query failed:', profileError.message);
      return errorResponse('Could not load your university.', 500);
    }
    const schoolId = payload.school_id ?? profile?.school_id;
    if (!isUuid(schoolId)) return errorResponse('Choose your university in your profile first.', 400);

    const gender = typeof payload.gender === 'string' ? payload.gender : 'prefer_not_to_say';
    const genderPreference = typeof payload.gender_preference === 'string' ? payload.gender_preference : 'any';
    if (!genders.has(gender) || !genderPreferences.has(genderPreference)) {
      return errorResponse('Choose valid gender and roommate preferences.', 400);
    }
    const budget = Number(payload.budget_share);
    if (!Number.isSafeInteger(budget) || budget < 0 || budget > 100_000_000) {
      return errorResponse('Enter a valid monthly or annual budget share in naira.', 400);
    }
    const preferredLocation = typeof payload.preferred_location === 'string' ? payload.preferred_location.trim().slice(0, 100) : '';
    const bio = typeof payload.bio === 'string' ? payload.bio.trim().slice(0, 500) : '';
    const lifestyle: Record<string, string> = {};
    for (const key of lifestyleKeys) {
      if (typeof payload[key] === 'string') lifestyle[key] = (payload[key] as string).trim().slice(0, 60);
    }
    const { data: roommate, error } = await supabase.from('roommate_profiles').upsert({
      student_id: user.id,
      school_id: schoolId,
      budget_max: budget,
      budget_share: budget,
      gender,
      gender_preference: genderPreference,
      preferred_location: preferredLocation || null,
      lifestyle_habits: lifestyle,
      study_habit: lifestyle.study_habit ?? null,
      cleanliness: lifestyle.cleanliness ?? null,
      social_style: lifestyle.social_style ?? null,
      smokes: payload.smokes === true,
      cooks: payload.cooks === true,
      bio: bio || null,
      contact_enabled: true,
      is_active: true,
    }, { onConflict: 'student_id' })
      .select('id, student_id, school_id, budget_share, preferred_location, lifestyle_habits, bio, gender, gender_preference, study_habit, cleanliness, social_style, smokes, cooks, contact_enabled, is_active')
      .single();
    if (error) {
      console.error('Roommate profile save failed:', error.message);
      return errorResponse('Could not save your roommate profile.', 500);
    }
    return NextResponse.json({ roommate });
  } catch (error) {
    console.error('Roommate profile request failed:', error);
    return errorResponse('Could not process your roommate profile.', 500);
  }
}

export async function DELETE() {
  try {
    const { supabase, user } = await getUser();
    if (!user) return errorResponse('Sign in to remove your roommate profile.', 401);
    const { error } = await supabase.from('roommate_profiles').delete().eq('student_id', user.id);
    if (error) {
      console.error('Roommate profile deletion failed:', error.message);
      return errorResponse('Could not remove your roommate profile.', 500);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Roommate profile deletion request failed:', error);
    return errorResponse('Could not process your roommate profile request.', 500);
  }
}
