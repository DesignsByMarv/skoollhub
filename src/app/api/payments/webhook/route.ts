import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { finalizePaystackPayment } from '@/lib/payments/server';

export async function POST(request: Request) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return NextResponse.json({ error: 'Payment webhook is not configured.' }, { status: 503 });

  const signature = request.headers.get('x-paystack-signature');
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }
  const body = await request.text();
  const expected = createHmac('sha512', secretKey).update(body).digest();
  const provided = Buffer.from(signature, 'hex');
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(body) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook body.' }, { status: 400 });
  }
  if (event.event !== 'charge.success') return NextResponse.json({ received: true });
  const reference = event.data?.reference;
  if (!reference || reference.length > 100) return NextResponse.json({ error: 'Missing payment reference.' }, { status: 400 });

  const result = await finalizePaystackPayment(reference);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });
  return NextResponse.json({ received: true });
}
