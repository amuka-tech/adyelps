import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, simulate } = body;

    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const supabase = createClient(await cookies());

    // Check DB first
    const { data: txRes, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', reference);

    if (txError || !txRes || txRes.length === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    const tx = txRes[0];

    // If it's already success, return
    if (tx.status === 'SUCCESS') return NextResponse.json({ status: 'SUCCESS' });

    // Simulation mode fallback for dev
    if (simulate || !paystackSecret || paystackSecret === 'dummy') {
      await fulfillTransaction(tx, supabase);
      return NextResponse.json({ status: 'SUCCESS' });
    }

    // Otherwise verify with Paystack explicitly (in case webhook is slow)
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });

    const data = await paystackRes.json();
    if (data.status && data.data.status === 'success') {
      await fulfillTransaction(tx, supabase);
      return NextResponse.json({ status: 'SUCCESS' });
    } else {
      return NextResponse.json({ status: 'FAILED', message: data.message });
    }
  } catch (err: any) {
    console.error("Verify error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Helper to fulfill business logic if verified on client before webhook
async function fulfillTransaction(tx: any, supabase: any) {
  // Check if still pending in DB to avoid double-fulfillment
  const { data: check } = await supabase
    .from('transactions')
    .select('status')
    .eq('reference', tx.reference)
    .single();

  if (check?.status === 'SUCCESS') return;

  await supabase
    .from('transactions')
    .update({ status: 'SUCCESS' })
    .eq('reference', tx.reference);

  const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;

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
