import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

function errorResponse(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Payment user verification failed:', authError.message);
      return errorResponse('Could not verify your account.', 500);
    }
    if (!user || !user.email_confirmed_at || !user.email) return errorResponse('Sign in with a confirmed email to subscribe.', 401);
    if (!process.env.PAYSTACK_SECRET_KEY) return errorResponse('Payments are not configured yet. Please try again later.', 503);

    let payload: unknown;
    try { payload = await request.json(); } catch { return errorResponse('Request body must be valid JSON.', 400); }
    const planCode = payload && typeof payload === 'object' && 'plan_code' in payload
      ? (payload as { plan_code?: unknown }).plan_code
      : null;
    const purpose = payload && typeof payload === 'object' && 'purpose' in payload
      ? (payload as { purpose?: unknown }).purpose
      : 'subscription';
    let resourceId: string | null = null;
    let amountKobo = 0;
    let paymentPurpose: 'subscription' | 'housing_contact' = 'subscription';
    let metadata: Record<string, string> = {};

    if (purpose === 'housing_contact') {
      const houseId = payload && typeof payload === 'object' && 'house_id' in payload
        ? (payload as { house_id?: unknown }).house_id
        : null;
      const fee = Number(process.env.HOUSING_CONTACT_FEE_KOBO);
      if (typeof houseId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(houseId)) {
        return errorResponse('Choose a valid housing listing.', 400);
      }
      if (!Number.isSafeInteger(fee) || fee <= 0) return errorResponse('Housing contact payments are not configured yet.', 503);
      const { data: house, error: houseError } = await supabase.from('houses')
        .select('id, owner_id, is_available').eq('id', houseId).maybeSingle();
      if (houseError) {
        console.error('Housing payment listing lookup failed:', houseError.message);
        return errorResponse('Could not load this housing listing.', 500);
      }
      if (!house || !house.is_available) return errorResponse('This listing is not available.', 404);
      if (house.owner_id === user.id) return errorResponse('You already own this listing.', 409);
      const { data: unlock, error: unlockError } = await supabase.from('housing_contact_unlocks')
        .select('id').eq('house_id', houseId).eq('user_id', user.id).maybeSingle();
      if (unlockError) {
        console.error('Housing contact payment lookup failed:', unlockError.message);
        return errorResponse('Could not check the contact unlock status.', 500);
      }
      if (unlock) return errorResponse('You already have this owner’s contact details.', 409);
      paymentPurpose = 'housing_contact';
      resourceId = houseId;
      amountKobo = fee;
      metadata = { house_id: houseId };
    } else {
      if (typeof planCode !== 'string' || !['premium', 'ai_pro'].includes(planCode)) {
        return errorResponse('Choose a valid subscription plan.', 400);
      }
      const { data: plan, error: planError } = await supabase.from('subscription_plans')
        .select('id, code, amount_kobo, is_active')
        .eq('code', planCode)
        .eq('is_active', true)
        .maybeSingle();
      if (planError) {
        console.error('Subscription plan lookup failed:', planError.message);
        return errorResponse('Could not load this subscription plan.', 500);
      }
      if (!plan || plan.amount_kobo <= 0) return errorResponse('This plan is not available for purchase yet.', 409);
      resourceId = plan.id;
      amountKobo = plan.amount_kobo;
      metadata = { plan_code: plan.code };
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    let callbackUrl: string;
    try {
      const base = new URL(siteUrl || '');
      if (base.protocol !== 'https:' && base.hostname !== 'localhost') throw new Error('HTTPS required');
      callbackUrl = new URL('/payments/complete', base).toString();
    } catch {
      return errorResponse('Payments are not configured for this website yet.', 503);
    }

    const reference = `skh_${randomUUID().replace(/-/g, '')}`;
    const { data: payment, error: insertError } = await supabase.from('payments').insert({
      user_id: user.id,
      purpose: paymentPurpose,
      amount_kobo: amountKobo,
      currency: 'NGN',
      provider: 'paystack',
      reference,
      status: 'pending',
      resource_id: resourceId,
      metadata,
    }).select('id').single();
    if (insertError || !payment) {
      console.error('Pending payment creation failed:', insertError?.message);
      return errorResponse('Could not start this payment. Please try again.', 500);
    }

    let response: Response;
    try {
      response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          amount: amountKobo,
          currency: 'NGN',
          reference,
          callback_url: callbackUrl,
          metadata: { ...metadata, payment_id: payment.id, user_id: user.id },
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      console.error('Paystack initialization request failed:', error);
      return errorResponse('Could not connect to Paystack. No payment confirmation was received; you can safely try again.', 502);
    }

    const result = await response.json() as {
      status?: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    };
    if (!response.ok || !result.status || !result.data?.authorization_url || result.data.reference !== reference) {
      console.error('Paystack initialization returned an error:', response.status, result.message);
      return errorResponse('Paystack could not start this payment. Please try again later.', 502);
    }
    return NextResponse.json({ authorization_url: result.data.authorization_url });
  } catch (error) {
    console.error('Payment initialization failed:', error);
    return errorResponse('Could not process this payment request.', 500);
  }
}
