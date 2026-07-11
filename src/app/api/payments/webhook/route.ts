import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
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

      // 1. Mark transaction as success
      await query(
        `UPDATE transactions SET status = 'SUCCESS' WHERE reference = ? AND status = 'PENDING'`,
        [reference]
      );

      // 2. Fetch the transaction to route logic
      const txRes: any = await query(`SELECT * FROM transactions WHERE reference = ?`, [reference]);
      if (txRes && txRes.length > 0) {
        const tx = txRes[0];
        const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata;

        // Route based on transaction type
        if (tx.type === 'EVENT_TICKET') {
          await query(
            `INSERT INTO event_tickets (user_id, event_id, ticket_type, price, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
            [tx.user_id, meta.event_id, meta.ticket_type, tx.amount]
          );
        } else if (tx.type === 'SHOP_ORDER') {
          // Add basic order
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
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
