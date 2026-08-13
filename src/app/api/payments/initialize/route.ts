import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, type, metadata } = body;
    // type = 'SHOP_ORDER' | 'EVENT_TICKET' | 'WELFARE_CONTRIBUTION'

    if (!amount || !type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const reference = crypto.randomBytes(16).toString('hex');

    // Store pending transaction
    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        reference,
        amount,
        type,
        metadata: JSON.stringify(metadata || {}),
        status: 'PENDING'
      });

    if (insertError) {
      throw insertError;
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackUrl = `${baseUrl}/payment/callback`;

    // If no real Paystack key is provided, we simulate the payment gateway 
    // to allow developers/testers to finish the flow.
    if (!paystackSecret || paystackSecret === 'dummy') {
      return NextResponse.json({ 
        checkoutUrl: `${callbackUrl}?reference=${reference}&simulate=true`
      });
    }

    // Real Paystack API Call
    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100), // Paystack uses kobo/cents
        reference,
        callback_url: callbackUrl,
        metadata: { custom_fields: [{ display_name: "Transaction Type", variable_name: "type", value: type }] }
      })
    });

    const data = await paystackRes.json();
    if (data.status) {
      return NextResponse.json({ checkoutUrl: data.data.authorization_url });
    } else {
      return NextResponse.json({ error: data.message || 'Failed to initialize payment on Paystack' }, { status: 500 });
    }
  } catch (err: any) {
    console.error("Payment init error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
