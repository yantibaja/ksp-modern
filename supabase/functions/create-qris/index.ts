import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const MIDTRANS_SERVER_KEY = Deno.env.get('MIDTRANS_SERVER_KEY') || ''

serve(async (req) => {
  const { order_id, gross_amount } = await req.json()

  const authHeader = 'Basic ' + btoa(MIDTRANS_SERVER_KEY + ':')

  const response = await fetch('https://api.sandbox.midtrans.com/v2/charge', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify({
      payment_type: 'gopay',
      transaction_details: {
        order_id: order_id,
        gross_amount: gross_amount
      }
    })
  })

  const data = await response.json()
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' }
  })
})
