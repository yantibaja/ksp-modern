import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

export default function Pembayaran() {
  const { profile } = useAuth()
  const [angsuranList, setAngsuranList] = useState([])
  const [bankList, setBankList] = useState([])
  const [selectedAngsuran, setSelectedAngsuran] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER')
  const [qrisUrl, setQrisUrl] = useState('')

  useEffect(() => {
    fetchAngsuran()
    fetchBankAccounts()
  }, [])

  const fetchAngsuran = async () => {
    let query = supabase.from('angsuran').select('*, pinjaman(*, profiles(*))').eq('status_bayar', false)
    if (profile.role === 'NASABAH') {
      query = query.eq('pinjaman.nasabah_id', profile.id)
    }
    const { data } = await query
    setAngsuranList(data || [])
  }

  const fetchBankAccounts = async () => {
    const { data } = await supabase.from('bank_accounts').select('*').eq('koperasi_id', profile.koperasi_id)
    setBankList(data || [])
  }

  const handleGenerateQRIS = async (item) => {
    setSelectedAngsuran(item)
    setPaymentMethod('QRIS')
    
    // Call Supabase Edge Function Midtrans
    const { data, error } = await supabase.functions.invoke('create-qris', {
      body: {
        order_id: `ANG-${item.id.slice(0, 8)}-${Date.now()}`,
        gross_amount: item.jumlah_tagihan + item.denda
      }
    })

    if (!error && data?.actions) {
      const qrisAction = data.actions.find(a => a.name === 'generate-qr-code')
      setQrisUrl(qrisAction?.url)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6 text-slate-800">Sistem Pembayaran Angsuran</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* List Tagihan */}
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100">
          <h2 className="font-semibold text-lg mb-4 text-slate-700">Daftar Tagihan Belum Lunas</h2>
          <div className="space-y-3">
            {angsuranList.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg hover:border-indigo-500 transition bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-slate-800">{item.pinjaman?.profiles?.nama_lengkap}</span>
                    <p className="text-xs text-slate-500">Angsuran Bulan ke-{item.bulan_ke}</p>
                  </div>
                  <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded">
                    Jatuh Tempo: {item.jatuh_tempo}
                  </span>
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-3">
                  Tagihan: Rp {(item.jumlah_tagihan + item.denda).toLocaleString('id-ID')}
                  {item.denda > 0 && <span className="text-xs text-red-500 ml-2">(Inc. Denda Rp {item.denda.toLocaleString('id-ID')})</span>}
                </div>
                
                {/* Opsi Tombol Pembayaran Sesuai Role */}
                <div className="flex space-x-2">
                  {['SUPER_ADMIN', 'ADMIN_KOPERASI', 'NASABAH'].includes(profile.role) && (
                    <button 
                      onClick={() => handleGenerateQRIS(item)}
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-semibold hover:bg-indigo-700"
                    >
                      Bayar QRIS
                    </button>
                  )}
                  {['SUPER_ADMIN', 'ADMIN_KOPERASI', 'PENAGIH', 'NASABAH'].includes(profile.role) && (
                    <button 
                      onClick={() => { setSelectedAngsuran(item); setPaymentMethod('TRANSFER'); }}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                    >
                      Transfer Bank
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail Pembayaran & Instruksi */}
        <div className="bg-white p-4 rounded-xl shadow border border-slate-100">
          <h2 className="font-semibold text-lg mb-4 text-slate-700">Instruksi Pembayaran</h2>
          {!selectedAngsuran ? (
            <p className="text-sm text-slate-400">Pilih salah satu tagihan di samping untuk melanjutkan pembayaran.</p>
          ) : (
            <div>
              {paymentMethod === 'QRIS' && (
                <div className="text-center py-4">
                  <p className="text-sm font-semibold mb-2">Scan QRIS menggunakan BCA, DANA, GoPay, OVO, dll</p>
                  {qrisUrl ? (
                    <img src={qrisUrl} alt="Midtrans QRIS Code" className="w-64 h-64 mx-auto border p-2 rounded-lg" />
                  ) : (
                    <p className="text-xs text-slate-400">Memuat QR Code...</p>
                  )}
                </div>
              )}

              {paymentMethod === 'TRANSFER' && (
                <div>
                  <p className="text-sm text-slate-600 mb-3">Silakan transfer sesuai nominal tepat ke salah satu rekening berikut:</p>
                  <div className="space-y-2 mb-4">
                    {bankList.map(bank => (
                      <div key={bank.id} className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                        <p className="font-bold text-sm text-indigo-900">{bank.nama_bank}</p>
                        <p className="text-lg font-mono font-bold text-indigo-700">{bank.no_rekening}</p>
                        <p className="text-xs text-indigo-500">a.n {bank.nama_pemilik}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
                          
