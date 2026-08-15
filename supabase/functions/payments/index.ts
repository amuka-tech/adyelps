import { createClient } from 'jsr:@supabase/supabase-js@2'
import crypto from 'node:crypto'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const action = url.pathname.split('/').pop()

  if (action === 'initialize') {
    return await handleInitialize(req)
  } else if (action === 'verify') {
    return await handleVerify(req)
  } else if (action === 'webhook') {
    return await handleWebhook(req)
  }

  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
})

async function handleInitialize(req: Request) {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { amount, type, metadata } = body

    if (!amount || !type) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: corsHeaders })
    }

    const reference = crypto.randomBytes(16).toString('hex')

    const { error: insertError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        reference,
        amount,
        type,
        metadata: JSON.stringify(metadata || {}),
        status: 'PENDING'
      })

    if (insertError) throw insertError

    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')
    const baseUrl = Deno.env.get('NEXT_PUBLIC_BASE_URL') || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/payment/callback`

    if (!paystackSecret || paystackSecret === 'dummy') {
      return new Response(JSON.stringify({ checkoutUrl: `${callbackUrl}?reference=${reference}&simulate=true` }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100),
        reference,
        callback_url: callbackUrl,
        metadata: { custom_fields: [{ display_name: "Transaction Type", variable_name: "type", value: type }] }
      })
    })

    const data = await paystackRes.json()
    if (data.status) {
      return new Response(JSON.stringify({ checkoutUrl: data.data.authorization_url }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    } else {
      return new Response(JSON.stringify({ error: data.message || 'Failed to initialize payment on Paystack' }), { status: 500, headers: corsHeaders })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
}

async function handleVerify(req: Request) {
  try {
    const body = await req.json()
    const { reference, simulate } = body

    if (!reference) return new Response(JSON.stringify({ error: 'Missing reference' }), { status: 400, headers: corsHeaders })

    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY')
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: txRes, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('reference', reference)

    if (txError || !txRes || txRes.length === 0) {
      return new Response(JSON.stringify({ error: 'Transaction not found' }), { status: 404, headers: corsHeaders })
    }
    const tx = txRes[0]

    if (tx.status === 'SUCCESS') {
      return new Response(JSON.stringify({ status: 'SUCCESS' }), { headers: corsHeaders })
    }

    if (simulate || !paystackSecret || paystackSecret === 'dummy') {
      await fulfillTransaction(tx, supabaseAdmin)
      return new Response(JSON.stringify({ status: 'SUCCESS' }), { headers: corsHeaders })
    }

    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${paystackSecret}` }
    })

    const data = await paystackRes.json()
    if (data.status && data.data.status === 'success') {
      await fulfillTransaction(tx, supabaseAdmin)
      return new Response(JSON.stringify({ status: 'SUCCESS' }), { headers: corsHeaders })
    } else {
      return new Response(JSON.stringify({ status: 'FAILED', message: data.message }), { headers: corsHeaders })
    }
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
}

async function handleWebhook(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')

    if (!secret || secret === 'dummy') {
      return new Response(JSON.stringify({ message: 'Ignoring webhook in dummy mode' }), { headers: corsHeaders })
    }

    const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex')
    if (hash !== signature) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400, headers: corsHeaders })
    }

    const event = JSON.parse(rawBody)

    if (event.event === 'charge.success') {
      const reference = event.data.reference
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabaseAdmin
        .from('transactions')
        .update({ status: 'SUCCESS' })
        .eq('reference', reference)
        .eq('status', 'PENDING')

      const { data: txRes } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .eq('reference', reference)

      if (txRes && txRes.length > 0) {
        const tx = txRes[0]
        await fulfillTransaction(tx, supabaseAdmin)
      }
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers: corsHeaders })
  } catch (error: any) {
    console.error("Webhook Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders })
  }
}

async function fulfillTransaction(tx: any, supabaseAdmin: any) {
  const { data: check } = await supabaseAdmin
    .from('transactions')
    .select('status')
    .eq('reference', tx.reference)
    .single()

  if (check?.status === 'SUCCESS') return

  await supabaseAdmin
    .from('transactions')
    .update({ status: 'SUCCESS' })
    .eq('reference', tx.reference)

  const meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata

  if (tx.type === 'EVENT_TICKET') {
    await supabaseAdmin.from('event_tickets').insert({
      user_id: tx.user_id,
      event_id: meta.event_id,
      ticket_type: meta.ticket_type,
      price: tx.amount,
      status: 'ACTIVE'
    })
  } else if (tx.type === 'SHOP_ORDER') {
    await supabaseAdmin.from('shop_orders').insert({
      user_id: tx.user_id,
      total_amount: tx.amount,
      status: 'PENDING'
    })
  } else if (tx.type === 'WELFARE_CONTRIBUTION') {
    await supabaseAdmin.from('welfare_ledger').insert({
      user_id: tx.user_id,
      amount: tx.amount,
      contribution_type: 'MONTHLY',
      status: 'VERIFIED'
    })
  }
}
