import { connection, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { finalizePaystackPayment } from '@/lib/payments/server';

export async function GET(request: Request) {
  try {
    await connection();
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Payment verification user lookup failed:', authError.message);
      return NextResponse.json({ error: 'Could not verify your account.' }, { status: 500 });
    }
    if (!user || !user.email_confirmed_at) {
      return NextResponse.json({ error: 'Sign in with a confirmed email to verify payment.' }, { status: 401 });
    }
    const reference = new URL(request.url).searchParams.get('reference');
    if (!reference || reference.length > 100) {
      return NextResponse.json({ error: 'Choose a valid payment reference.' }, { status: 400 });
    }
    const result = await finalizePaystackPayment(reference, user.id);
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({
      success: true,
      purpose: result.purpose,
      resource_id: result.resourceId,
    });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json({ error: 'Could not process payment verification.' }, { status: 500 });
  }
}
