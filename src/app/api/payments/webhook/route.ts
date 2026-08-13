import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret || secret === 'dummy') {
      return NextResponse.json({ message: 'Ignoring webhook in dummy mode' });
    }

    // Verify signature
    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const reference = event.data.reference;
      const supabase = createClient(await cookies());

      // 1. Mark transaction as success
      await supabase
        .from('transactions')
        .update({ status: 'SUCCESS' })
        .eq('reference', reference)
        .eq('status', 'PENDING');

      // 2. Fetch the transaction to route logic
      const { data: txRes } = await supabase
        .from('transactions')
        .select('*')
        .eq('reference', reference);

      if (txRes && txRes.length > 0) {
        const tx = txRes[0];
        const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;

        // Route based on transaction type
        if (tx.type === 'EVENT_TICKET') {
          await supabase.from('event_tickets').insert({
            user_id: tx.user_id,
            event_id: meta.event_id,
            ticket_type: meta.ticket_type,
            price: tx.amount,
            status: 'ACTIVE'
          });
        } else if (tx.type === 'SHOP_ORDER') {
          await supabase.from('shop_orders').insert({
            user_id: tx.user_id,
            total_amount: tx.amount,
            status: 'PENDING'
          });
        } else if (tx.type === 'WELFARE_CONTRIBUTION') {
          await supabase.from('welfare_ledger').insert({
            user_id: tx.user_id,
            amount: tx.amount,
            contribution_type: 'MONTHLY',
            status: 'VERIFIED'
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
