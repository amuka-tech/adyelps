import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const obituaryId = params.id;

    // Fetch the obituary details (mainly for target amount and status)
    const obituaries: any = await query(`SELECT * FROM obituaries WHERE id = ?`, [obituaryId]);
    if (obituaries.length === 0) {
      return NextResponse.json({ error: 'Obituary not found' }, { status: 404 });
    }
    const obituary = obituaries[0];

    // Fetch ONLY verified contributions for this obituary, with user details
    const contributions: any = await query(
      `SELECT c.id, c.amount_gross, c.payment_method, c.created_at, u.first_name, u.last_name 
       FROM contributions c
       JOIN users u ON c.user_id = u.id
       WHERE c.obituary_id = ? AND c.status = 'VERIFIED'
       ORDER BY c.created_at DESC`,
      [obituaryId]
    );

    // Fetch all active deduction rates
    const rates: any = await query(`SELECT * FROM deduction_rates WHERE is_active = TRUE`);

    let totalGross = 0;
    let totalMomoGross = 0;
    
    // Sum gross contributions
    contributions.forEach((c: any) => {
      const amt = parseFloat(c.amount_gross);
      totalGross += amt;
      if (c.payment_method === 'MOBILE_MONEY') {
        totalMomoGross += amt;
      }
    });

    let totalDeductions = 0;
    const deductionsBreakdown: any[] = [];

    // Calculate Mobile Money Withdrawal Fee and Tax based on tier + 0.5% tax
    function getMoMoWithdrawalComponents(amount: number) {
      if (amount <= 0) return { fee: 0, tax: 0 };
      let fee = 0;
      if (amount >= 500 && amount <= 2500) fee = 330;
      else if (amount >= 2501 && amount <= 5000) fee = 440;
      else if (amount >= 5001 && amount <= 15000) fee = 700;
      else if (amount >= 15001 && amount <= 30000) fee = 880;
      else if (amount >= 30001 && amount <= 45000) fee = 1210;
      else if (amount >= 45001 && amount <= 60000) fee = 1500;
      else if (amount >= 60001 && amount <= 125000) fee = 1925;
      else if (amount >= 125001 && amount <= 250000) fee = 3575;
      else if (amount >= 250001 && amount <= 500000) fee = 7000;
      else if (amount >= 500001 && amount <= 1000000) fee = 12500;
      else if (amount >= 1000001 && amount <= 2000000) fee = 15000;
      else if (amount >= 2000001 && amount <= 4000000) fee = 18000;
      else if (amount > 4000000) fee = 20000; // Max tier covers 4,000,001+

      const tax = Math.round(amount * 0.005); // 0.5% withdrawal tax rounded to nearest UGX
      return { fee, tax };
    }

    if (totalGross > 0) {
      const { fee, tax } = getMoMoWithdrawalComponents(totalGross);
      
      if (fee > 0) {
        totalDeductions += fee;
        deductionsBreakdown.push({
          name: 'Mobile Money Withdrawal Fee',
          amount: fee
        });
      }

      if (tax > 0) {
        totalDeductions += tax;
        deductionsBreakdown.push({
          name: 'Mobile Money Tax (0.5%)',
          amount: tax
        });
      }
    }

    // Calculate other custom database deductions
    rates.forEach((rate: any) => {
      // Skip if the user mistakenly added a manual "Mobile Money" rate in the DB to avoid double charging
      if (rate.name.toLowerCase().includes('mobile money') || rate.name.toLowerCase().includes('momo')) return;

      let deductionAmount = 0;
      if (rate.rate_type === 'PERCENTAGE') {
        deductionAmount = Math.round(totalGross * (parseFloat(rate.amount) / 100));
      } else if (rate.rate_type === 'FIXED') {
        deductionAmount = Math.round(parseFloat(rate.amount));
        if (totalGross === 0) deductionAmount = 0;
      }
      
      totalDeductions += deductionAmount;
      if (deductionAmount > 0) {
        deductionsBreakdown.push({
          name: rate.name,
          amount: deductionAmount
        });
      }
    });

    const netAmount = totalGross - totalDeductions;

    // Fetch disbursements if any
    const disbursements: any = await query(`SELECT * FROM disbursements WHERE obituary_id = ?`, [obituaryId]);
    let totalDisbursed = 0;
    disbursements.forEach((d: any) => {
      totalDisbursed += parseFloat(d.amount_net);
    });

    return NextResponse.json({
      ledger: {
        totalGross,
        totalDeductions,
        deductionsBreakdown,
        netAmount,
        totalDisbursed,
        targetAmount: parseFloat(obituary.target_amount) || null,
        status: obituary.status,
        contributionLog: contributions
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
