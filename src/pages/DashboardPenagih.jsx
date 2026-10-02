import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function DashboardPenagih() {
  const { profile } = useAuth()
  const [tugasList, setTugasList] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
      fetchTugas()
      fetchNotifications()
    }
  }, [profile])

  const fetchTugas = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('tugas_penagihan')
      .select(`
        id,
        status_tugas,
        angsuran (
          id,
          jumlah_tagihan,
          denda,
          jatuh_tempo,
          pinjaman (
            profiles:nasabah_id (
              nama_lengkap,
              no_hp,
              alamat
            )
          )
        )
      `)
      .eq('penagih_id', profile.id)
      .eq('tanggal_penagihan', today)

    setTugasList(data || [])
    setLoading(false)
  }

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5)

    setNotifications(data || [])
  }

  const handleSetLunasCash = async (tugas) => {
    const confirm = window.confirm(`Konfirmasi pembayaran CASH dari ${tugas.angsuran.pinjaman.profiles.nama_lengkap}?`)
    if (!confirm) return

    const total = Number(tugas.angsuran.jumlah_tagihan) + Number(tugas.angsuran.denda)

    // 1. Catat transaksi pembayaran cash
    await supabase.from('pembayaran').insert({
      angsuran_id: tugas.angsuran.id,
      metode: 'CASH',
      jumlah_dibayar: total,
      status_verifikasi: true
    })

    // 2. Update status angsuran
    await supabase.from('angsuran').update({ status_bayar: true }).eq('id', tugas.angsuran.id)

    // 3. Update tugas penagihan
    await supabase.from('tugas_penagihan').update({
      status_tugas: 'SELESAI',
      catatan_penagih: 'Dibayar Tunai (CASH) ke Penagih'
    }).eq('id', tugas.id)

    alert('Pembayaran CASH Berhasil Disimpan!')
    fetchTugas()
  }

  if (loading) return <div className="p-6">Memuat tugas penagihan...</div>

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-slate-800">Dashboard Penagih Field</h1>

      {/* Box Notifikasi Terkini */}
      {notifications.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-bold text-amber-800 text-sm mb-2">Notifikasi Tugas Terbaru:</h2>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id} className="text-xs text-amber-900 bg-white p-2 rounded border border-amber-100">
                <p className="font-semibold">{n.title}</p>
                <p>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daftar Tugas Hari Ini */}
      <div className="bg-white rounded-xl shadow border border-slate-100 p-4">
        <h2 className="font-semibold text-lg text-slate-800 mb-4">Tugas Penagihan Hari Ini</h2>
        {tugasList.length === 0 ? (
          <p className="text-sm text-slate-400">Tidak ada tugas penagihan terlambat untuk hari ini.</p>
        ) : (
          <div className="space-y-4">
            {tugasList.map((item) => {
              const nasabah = item.angsuran?.pinjaman?.profiles
              const totalTagihan = Number(item.angsuran?.jumlah_tagihan || 0) + Number(item.angsuran?.denda || 0)

              return (
                <div key={item.id} className="border rounded-xl p-4 bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-800">{nasabah?.nama_lengkap}</h3>
                      <p className="text-xs text-slate-500">{nasabah?.alamat}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                      item.status_tugas === 'SELESAI' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.status_tugas}
                    </span>
                  </div>

                  <div className="my-3 p-3 bg-white rounded-lg border text-sm">
                    <p className="text-xs text-slate-500">Total Harus Dibayar:</p>
                    <p className="font-bold text-lg text-indigo-600">Rp {totalTagihan.toLocaleString('id-ID')}</p>
                  </div>

                  {item.status_tugas !== 'SELESAI' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetLunasCash(item)}
                        className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition"
                      >
                        Terima CASH
                      </button>
                      <a
                        href={`https://wa.me/${nasabah?.no_hp?.replace(/^0/, '62')}?text=${encodeURIComponent(`Halo ${nasabah?.nama_lengkap}, saya penagih resmi Koperasi. Mohon siapkan pembayaran angsuran sebesar Rp ${totalTagihan.toLocaleString('id-ID')}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center bg-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-indigo-700 transition"
                      >
                        Hubungi WA
                      </a>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
