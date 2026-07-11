import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const user: any = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { amount, type, metadata } = body;
    // type = 'SHOP_ORDER' | 'EVENT_TICKET' | 'WELFARE_CONTRIBUTION'

    if (!amount || !type) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

    const reference = crypto.randomBytes(16).toString('hex');

    // Store pending transaction
    await query(
      `INSERT INTO transactions (user_id, reference, amount, type, metadata, status) VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [user.id, reference, amount, type, JSON.stringify(metadata || {})]
    );

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
