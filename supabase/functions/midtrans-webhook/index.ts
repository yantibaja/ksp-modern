import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const notification = await req.json()
    
    const orderId = notification.order_id
    const transactionStatus = notification.transaction_status
    const fraudStatus = notification.fraud_status

    // Ambil angsuran_id dari order_id (Format order_id: ANG-{angsuran_id}-{timestamp})
    const angsuranId = orderId.split('-')[1]

    if (!angsuranId) {
      return new Response('Invalid Order ID Format', { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verifikasi Pembayaran Sukses
    if (transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept')) {
      
      // 1. Update status angsuran menjadi Lunas (TRUE)
      await supabase
        .from('angsuran')
        .update({ status_bayar: true })
        .eq('id', angsuranId)

      // 2. Tandai pembayaran di tabel pembayaran
      await supabase
        .from('pembayaran')
        .update({ status_verifikasi: true })
        .eq('midtrans_order_id', orderId)

      // 3. Update status tugas penagihan jika ada
      await supabase
        .from('tugas_penagihan')
        .update({ status_tugas: 'SELESAI', catatan_penagih: 'Lunas via Midtrans QRIS' })
        .eq('angsuran_id', angsuranId)
    }

    return new Response(JSON.stringify({ status: 'OK' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})
