import { connection, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    await connection();
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Subscription account verification failed:', authError.message);
      return NextResponse.json({ error: 'Could not verify your account.' }, { status: 500 });
    }
    if (!user || !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Sign in with a confirmed email to view plans.' }, { status: 401 });
    }

    const [plansResult, subscriptionResult] = await Promise.all([
      supabase.from('subscription_plans')
        .select('id, code, name, description, amount_kobo, billing_interval, features')
        .eq('is_active', true)
        .order('amount_kobo'),
      supabase.from('user_subscriptions')
        .select('id, status, started_at, expires_at, subscription_plans(name, code)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (plansResult.error || subscriptionResult.error) {
      console.error('Subscription data query failed:', plansResult.error?.message ?? subscriptionResult.error?.message);
      return NextResponse.json({ error: 'Could not load subscription details. Apply the student-life Supabase migration first if needed.' }, { status: 500 });
    }
    return NextResponse.json({ plans: plansResult.data ?? [], subscription: subscriptionResult.data ?? null });
  } catch (error) {
    console.error('Subscription request failed:', error);
    return NextResponse.json({ error: 'Could not process your subscription request.' }, { status: 500 });
  }
}
