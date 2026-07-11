import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { reference, simulate } = body;

    if (!reference) return NextResponse.json({ error: 'Missing reference' }, { status: 400 });

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    // Check DB first
    const txRes: any = await query(`SELECT * FROM transactions WHERE reference = ?`, [reference]);
    if (!txRes || txRes.length === 0) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    const tx = txRes[0];

    // If it's already success, return
    if (tx.status === 'SUCCESS') return NextResponse.json({ status: 'SUCCESS' });

    // Simulation mode fallback for dev
    if (simulate || !paystackSecret || paystackSecret === 'dummy') {
      await fulfillTransaction(tx);
      return NextResponse.json({ status: 'SUCCESS' });
    }

    // Otherwise verify with Paystack explicitly (in case webhook is slow)
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });

    const data = await paystackRes.json();
    if (data.status && data.data.status === 'success') {
      await fulfillTransaction(tx);
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
async function fulfillTransaction(tx: any) {
  // Check if still pending in DB to avoid double-fulfillment
  const check: any = await query(`SELECT status FROM transactions WHERE reference = ?`, [tx.reference]);
  if (check[0].status === 'SUCCESS') return;

  await query(`UPDATE transactions SET status = 'SUCCESS' WHERE reference = ?`, [tx.reference]);

  const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;

  if (tx.type === 'EVENT_TICKET') {
    await query(
      `INSERT INTO event_tickets (user_id, event_id, ticket_type, price, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [tx.user_id, meta.event_id, meta.ticket_type, tx.amount]
    );
  } else if (tx.type === 'SHOP_ORDER') {
    await query(
      `INSERT INTO shop_orders (user_id, total_amount, status) VALUES (?, ?, 'PENDING')`,
      [tx.user_id, tx.amount]
    );
  } else if (tx.type === 'WELFARE_CONTRIBUTION') {
    await query(
      `INSERT INTO welfare_ledger (user_id, amount, contribution_type, status) VALUES (?, ?, 'MONTHLY', 'VERIFIED')`,
      [tx.user_id, tx.amount]
    );
  }
}
