import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const today = new Date().toISOString().split('T')[0]

  // 1. Cek Apakah Hari Ini Tanggal Merah
  const { data: isHoliday } = await supabase
    .from('tanggal_merah')
    .select('id')
    .eq('tanggal', today)
    .single()

  if (isHoliday) {
    return new Response(
      JSON.stringify({ message: "Hari Libur / Tanggal Merah. Denda & Penagihan di-bypass." }), 
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    )
  }

  // 2. Ambil Semua Angsuran Terlambat (lewat jatuh tempo & belum bayar)
  const { data: overdueList, error } = await supabase
    .from('angsuran')
    .select(`
      id,
      jumlah_tagihan,
      denda,
      pinjaman (
        id,
        koperasi_id,
        nasabah_id,
        profiles:nasabah_id (
          nama_lengkap,
          alamat,
          no_hp
        )
      )
    `)
    .eq('status_bayar', false)
    .lt('jatuh_tempo', today)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  let assignedCount = 0

  for (const item of overdueList || []) {
    const koperasiId = item.pinjaman.koperasi_id

    // A. Update Denda
    const { data: setting } = await supabase
      .from('settings_denda')
      .select('persen_denda_per_hari')
      .eq('koperasi_id', koperasiId)
      .single()

    const rate = setting?.persen_denda_per_hari || 0.5
    const addedDenda = Number(item.denda || 0) + (Number(item.jumlah_tagihan) * (rate / 100))

    await supabase
      .from('angsuran')
      .update({ denda: addedDenda })
      .eq('id', item.id)

    // B. Cari Penagih Aktif di Koperasi Tersebut
    const { data: penagihList } = await supabase
      .from('profiles')
      .select('id')
      .eq('koperasi_id', koperasiId)
      .eq('role', 'PENAGIH')
      .eq('status', 'APPROVED')
      .eq('is_blocked', false)

    if (penagihList && penagihList.length > 0) {
      // Round-robin atau assign ke penagih pertama
      const penagihId = penagihList[assignedCount % penagihList.length].id

      // C. Buat Tugas Penagihan (Hindari duplikasi tugas di hari yang sama)
      const { data: existingTask } = await supabase
        .from('tugas_penagihan')
        .select('id')
        .eq('angsuran_id', item.id)
        .eq('tanggal_penagihan', today)
        .single()

      if (!existingTask) {
        await supabase.from('tugas_penagihan').insert({
          koperasi_id: koperasiId,
          angsuran_id: item.id,
          penagih_id: penagihId,
          tanggal_penagihan: today,
          status_tugas: 'PENDING'
        })

        // D. Buat Notifikasi Dashboard ke Penagih
        await supabase.from('notifications').insert({
          user_id: penagihId,
          title: 'Tugas Penagihan Baru',
          message: `Segera tagih nasabah ${item.pinjaman.profiles.nama_lengkap} - Alamat: ${item.pinjaman.profiles.alamat}`,
          is_read: false
        })

        assignedCount++
      }
    }
  }

  return new Response(
    JSON.stringify({ success: true, processed: overdueList?.length, tasksCreated: assignedCount }), 
    { headers: { 'Content-Type': 'application/json' }, status: 200 }
  )
})
