import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function PesanWA() {
  const [overdueList, setOverdueList] = useState([])
  const [broadcastMessage, setBroadcastMessage] = useState('')

  useEffect(() => {
    fetchOverdue()
  }, [])

  const fetchOverdue = async () => {
    const { data } = await supabase
      .from('angsuran')
      .select('*, pinjaman(*, profiles(*))')
      .eq('status_bayar', false)
    setOverdueList(data || [])
  }

  const handleSendWATagihan = (item) => {
    const phone = item.pinjaman.profiles.no_hp.replace(/^0/, '62')
    const total = (item.jumlah_tagihan + item.denda).toLocaleString('id-ID')
    const text = encodeURIComponent(
      `Halo ${item.pinjaman.profiles.nama_lengkap}, tagihan pinjaman Anda sebesar Rp ${total} telah jatuh tempo pada tanggal ${item.jatuh_tempo}. Mohon segera melakukan pembayaran. Terima kasih.`
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Manajemen Pesan & Penagihan WhatsApp</h1>

      {/* Broadcast Section */}
      <div className="bg-white p-5 rounded-xl shadow border border-slate-100 mb-6">
        <h2 className="font-semibold text-lg mb-2 text-slate-700">Broadcast Marketing WhatsApp</h2>
        <textarea 
          placeholder="Tulis pesan promosi / pengumuman untuk seluruh nasabah..." 
          className="w-full border p-3 rounded-lg text-sm mb-3"
          rows="3"
          value={broadcastMessage}
          onChange={(e) => setBroadcastMessage(e.target.value)}
        ></textarea>
        <button 
          onClick={() => alert('Membuka antrean broadcast WhatsApp...')} 
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          Kirim Broadcast ke Semua Nasabah
        </button>
      </div>

      {/* Penagihan List Section */}
      <div className="bg-white p-5 rounded-xl shadow border border-slate-100">
        <h2 className="font-semibold text-lg mb-4 text-slate-700">Daftar Nasabah Jatuh Tempo</h2>
        <div className="divide-y">
          {overdueList.map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-slate-800">{item.pinjaman?.profiles?.nama_lengkap}</p>
                <p className="text-xs text-slate-500">No HP: {item.pinjaman?.profiles?.no_hp} | Jatuh Tempo: {item.jatuh_tempo}</p>
              </div>
              <button 
                onClick={() => handleSendWATagihan(item)}
                className="bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 flex items-center space-x-1"
              >
                <span>Tagih via WhatsApp</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
