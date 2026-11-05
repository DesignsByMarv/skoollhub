import { connection, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

async function getAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw new Error(`Could not verify session: ${authError.message}`);
  if (!user || !user.email_confirmed_at) return { supabase, admin: false };
  const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (error) throw new Error(`Could not verify administrator role: ${error.message}`);
  return { supabase, admin: profile?.role === 'admin' || profile?.role === 'moderator' };
}

export async function GET() {
  try {
    await connection();
    const { supabase, admin } = await getAdmin();
    if (!admin) return errorResponse('Administrator access is required.', 403);
    const [housesResult, plansResult, profilesCount, housesCount, materialsCount, pendingPaymentsCount] = await Promise.all([
      supabase.from('houses')
        .select('id, title, owner_id, area_name, price_per_year, created_at, is_verified, is_featured')
        .eq('is_verified', false)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase.from('subscription_plans')
        .select('id, code, name, amount_kobo, billing_interval, is_active')
        .order('amount_kobo'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('houses').select('id', { count: 'exact', head: true }),
      supabase.from('course_materials').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    const failure = housesResult.error ?? plansResult.error ?? profilesCount.error ?? housesCount.error ?? materialsCount.error ?? pendingPaymentsCount.error;
    if (failure) {
      console.error('Admin dashboard query failed:', failure.message);
      return errorResponse('Could not load the admin dashboard. Apply the student-life migration if needed.', 500);
    }
    return NextResponse.json({
      listings: housesResult.data ?? [],
      plans: plansResult.data ?? [],
      metrics: {
        students: profilesCount.count ?? 0,
        listings: housesCount.count ?? 0,
        materials: materialsCount.count ?? 0,
        pendingPayments: pendingPaymentsCount.count ?? 0,
      },
    });
  } catch (error) {
    console.error('Admin dashboard request failed:', error);
    return errorResponse('Could not process the admin dashboard request.', 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const { supabase, admin } = await getAdmin();
    if (!admin) return errorResponse('Administrator access is required.', 403);
    let payload: unknown;
    try { payload = await request.json(); } catch { return errorResponse('Request body must be valid JSON.', 400); }
    if (!payload || typeof payload !== 'object') return errorResponse('Enter valid admin updates.', 400);
    const data = payload as Record<string, unknown>;

    if (data.type === 'listing') {
      if (typeof data.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id)
        || typeof data.is_verified !== 'boolean') return errorResponse('Choose a valid listing and review state.', 400);
      const updates: { is_verified: boolean; is_featured?: boolean } = { is_verified: data.is_verified };
      if (typeof data.is_featured === 'boolean') updates.is_featured = data.is_featured;
      const { data: listing, error } = await supabase.from('houses').update(updates)
        .eq('id', data.id).select('id, is_verified, is_featured').maybeSingle();
      if (error) {
        console.error('Admin listing update failed:', error.message);
        return errorResponse('Could not update this listing.', 500);
      }
      if (!listing) return errorResponse('Listing not found.', 404);
      return NextResponse.json({ listing });
    }

    if (data.type === 'plan') {
      if (typeof data.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.id)
        || !Number.isSafeInteger(data.amount_kobo) || Number(data.amount_kobo) < 0
        || typeof data.is_active !== 'boolean') {
        return errorResponse('Enter a non-negative price and choose whether the plan is available.', 400);
      }
      const { data: plan, error } = await supabase.from('subscription_plans')
        .update({ amount_kobo: Number(data.amount_kobo), is_active: data.is_active, updated_at: new Date().toISOString() })
        .eq('id', data.id)
        .select('id, code, amount_kobo, is_active')
        .maybeSingle();
      if (error) {
        console.error('Admin subscription plan update failed:', error.message);
        return errorResponse('Could not update this subscription plan.', 500);
      }
      if (!plan) return errorResponse('Subscription plan not found.', 404);
      return NextResponse.json({ plan });
    }

    return errorResponse('Choose a valid admin update type.', 400);
  } catch (error) {
    console.error('Admin update request failed:', error);
    return errorResponse('Could not process the admin update.', 500);
  }
}
