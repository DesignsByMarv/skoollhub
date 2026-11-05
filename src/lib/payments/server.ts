import { createClient } from '@supabase/supabase-js';

type PaystackVerification = {
  status: boolean;
  message?: string;
  data?: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
  };
};

export function createPaymentAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function finalizePaystackPayment(reference: string, userId?: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  const admin = createPaymentAdminClient();
  if (!secretKey || !admin) {
    return { error: 'Payment verification is not configured. Contact the site administrator before retrying payment.', status: 503 };
  }

  const paymentQuery = admin.from('payments')
    .select('id, user_id, purpose, amount_kobo, currency, reference, status, resource_id')
    .eq('reference', reference);
  const { data: payment, error: paymentError } = userId
    ? await paymentQuery.eq('user_id', userId).maybeSingle()
    : await paymentQuery.maybeSingle();
  if (paymentError) {
    console.error('Payment record lookup failed:', paymentError.message);
    return { error: 'Could not load this payment.', status: 500 };
  }
  if (!payment) return { error: 'Payment reference not found.', status: 404 };

  let response: Response;
  try {
    response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Paystack verification request failed:', error);
    return { error: 'Could not verify the payment with Paystack. Please try again later.', status: 502 };
  }
  const result = await response.json() as PaystackVerification;
  if (!response.ok || !result.status || !result.data) {
    console.error('Paystack verification returned an error:', response.status, result.message);
    return { error: 'Paystack could not verify this payment.', status: 502 };
  }
  if (result.data.reference !== payment.reference || result.data.status !== 'success') {
    if (result.data.status === 'failed' && payment.status === 'pending') {
      const { error } = await admin.from('payments').update({ status: 'failed' }).eq('id', payment.id);
      if (error) console.error('Failed payment status update failed:', error.message);
    }
    return { error: 'Paystack has not confirmed a successful payment.', status: 409 };
  }
  if (result.data.amount !== payment.amount_kobo || result.data.currency !== payment.currency) {
    console.error('Paystack amount or currency did not match the stored payment:', payment.id);
    return { error: 'The verified payment amount did not match the requested amount. Contact support.', status: 409 };
  }

  if (payment.status !== 'success') {
    const { error } = await admin.from('payments')
      .update({ status: 'success', paid_at: new Date().toISOString() })
      .eq('id', payment.id)
      .eq('status', 'pending');
    if (error) {
      console.error('Payment success update failed:', error.message);
      return { error: 'The payment was verified but could not be recorded. Contact support.', status: 500 };
    }
  }

  if (payment.purpose === 'subscription' && payment.resource_id) {
    const { data: plan, error: planError } = await admin.from('subscription_plans')
      .select('id, billing_interval, is_active, amount_kobo')
      .eq('id', payment.resource_id)
      .maybeSingle();
    if (planError || !plan || plan.amount_kobo !== payment.amount_kobo) {
      console.error('Verified subscription payment could not be matched to an active plan:', planError?.message ?? payment.id);
      return { error: 'The payment was verified, but the subscription plan could not be activated. Contact support.', status: 500 };
    }
    const { data: existingPaymentSubscription, error: existingError } = await admin.from('user_subscriptions')
      .select('id')
      .eq('payment_id', payment.id)
      .maybeSingle();
    if (existingError) {
      console.error('Subscription payment lookup failed:', existingError.message);
      return { error: 'The payment was verified, but the subscription could not be confirmed.', status: 500 };
    }
    if (!existingPaymentSubscription) {
      const now = new Date();
      const expiresAt = new Date(now);
      if (plan.billing_interval === 'year') expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      else expiresAt.setMonth(expiresAt.getMonth() + 1);
      const { error: expireError } = await admin.from('user_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', payment.user_id)
        .eq('status', 'active');
      if (expireError) {
        console.error('Previous subscription update failed:', expireError.message);
        return { error: 'The payment was verified, but the subscription could not be activated.', status: 500 };
      }
      const { error: subscriptionError } = await admin.from('user_subscriptions').insert({
        user_id: payment.user_id,
        plan_id: plan.id,
        payment_id: payment.id,
        status: 'active',
        started_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      });
      if (subscriptionError) {
        const { data: concurrentSubscription } = await admin.from('user_subscriptions')
          .select('id').eq('payment_id', payment.id).maybeSingle();
        if (concurrentSubscription) {
          return { success: true, paymentId: payment.id, purpose: payment.purpose, resourceId: payment.resource_id };
        }
        console.error('Subscription activation failed:', subscriptionError.message);
        return { error: 'The payment was verified, but the subscription could not be activated.', status: 500 };
      }
    }
  }

  if (payment.purpose === 'housing_contact' && payment.resource_id) {
    const { data: existingUnlock, error: unlockQueryError } = await admin.from('housing_contact_unlocks')
      .select('id').eq('house_id', payment.resource_id).eq('user_id', payment.user_id).maybeSingle();
    if (unlockQueryError) {
      console.error('Housing contact unlock lookup failed:', unlockQueryError.message);
      return { error: 'The payment was verified, but the housing contact could not be unlocked.', status: 500 };
    }
    if (!existingUnlock) {
      const { error: unlockError } = await admin.from('housing_contact_unlocks').insert({
        house_id: payment.resource_id,
        user_id: payment.user_id,
        payment_id: payment.id,
      });
      if (unlockError) {
        const { data: concurrentUnlock } = await admin.from('housing_contact_unlocks')
          .select('id').eq('house_id', payment.resource_id).eq('user_id', payment.user_id).maybeSingle();
        if (!concurrentUnlock) {
          console.error('Housing contact unlock creation failed:', unlockError.message);
          return { error: 'The payment was verified, but the housing contact could not be unlocked.', status: 500 };
        }
      }
    }
  }

  return { success: true, paymentId: payment.id, purpose: payment.purpose, resourceId: payment.resource_id };
}
