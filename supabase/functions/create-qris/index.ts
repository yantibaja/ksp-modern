import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY')

serve(async (req) => {
  const { order_id, gross_amount, customer_details } = await req.json()

  const authHeader = btoa(`${MIDTRANS_SERVER_KEY}:`)
  const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authHeader}`
    },
    body: JSON.stringify({
      payment_type: 'qris',
      transaction_details: { order_id, gross_amount },
      customer_details
    })
  })

  const data = await response.json()
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
})
