import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const today = new Date().toISOString().split('T')[0]

  // Cek apakah hari ini tanggal merah
  const { data: isHolidays } = await supabase.from('tanggal_merah').select('tanggal').eq('tanggal', today)

  if (isHolidays && isHolidays.length > 0) {
    return new Response(JSON.stringify({ message: "Hari Libur. Denda di-bypass." }), { status: 200 })
  }

  // Update denda angsuran yang lewat jatuh tempo
  const { data: overdueList } = await supabase
    .from('angsuran')
    .select('id, pinjaman_id, jumlah_tagihan, jatuh_tempo, pinjaman(koperasi_id)')
    .eq('status_bayar', false)
    .lt('jatuh_tempo', today)

  for (const item of overdueList || []) {
    // Hitung denda berdasarkan setting koperasi
    const { data: setting } = await supabase.from('settings_denda').select('persen_denda_per_hari').eq('koperasi_id', item.pinjaman.koperasi_id).single()
    const rate = setting?.persen_denda_per_hari || 0.5
    const addedDenda = item.jumlah_tagihan * (rate / 100)

    await supabase.from('angsuran').update({ denda: addedDenda }).eq('id', item.id)
  }

  return new Response(JSON.stringify({ updated: overdueList?.length || 0 }), { status: 200 })
})
  
