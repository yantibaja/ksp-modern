import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function RegisterNasabah() {
  const [form, setForm] = useState({
    kodeKoperasi: '', nama: '', nik: '', noHp: '', email: '', password: '',
    alamat: '', rt: '', rw: '', kelurahan: '', kecamatan: '', kota: '', provinsi: '', kodePos: '',
    punyaUsaha: false
  })
  const [files, setFiles] = useState({ ktp: null, usaha: null, selfie: null })
  const [error, setError] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    // 1. Validasi NIK & No HP Blokir
    const { data: blocked } = await supabase
      .from('blocked_list')
      .select('value')
      .in('value', [form.nik, form.noHp])

    if (blocked && blocked.length > 0) {
      setError('NIK atau Nomor HP Anda terblokir dari sistem.')
      return
    }

    // 2. Validasi Kode Koperasi
    const { data: kop } = await supabase
      .from('koperasi')
      .select('id')
      .eq('kode_unik', form.kodeKoperasi.toUpperCase())
      .single()

    if (!kop) {
      setError('Kode Koperasi tidak valid!')
      return
    }

    // 3. Signup Supabase Auth
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (authErr) { setError(authErr.message); return }

    // 4. Upload Files ke Storage
    const ktpPath = `ktp/${authData.user.id}_ktp`
    const selfiePath = `selfie/${authData.user.id}_selfie`
    await supabase.storage.from('ktp').upload(ktpPath, files.ktp)
    await supabase.storage.from('ktp').upload(selfiePath, files.selfie)

    let fotoUsahaPath = null
    if (form.punyaUsaha && files.usaha) {
      fotoUsahaPath = `usaha/${authData.user.id}_usaha`
      await supabase.storage.from('foto_usaha').upload(fotoUsahaPath, files.usaha)
    }

    // 5. Insert Profiles & Detail
    await supabase.from('profiles').insert({
      id: authData.user.id,
      koperasi_id: kop.id,
      role: 'NASABAH',
      nik: form.nik,
      no_hp: form.noHp,
      nama_lengkap: form.nama,
      alamat: form.alamat,
      status: 'PENDING'
    })

    await supabase.from('nasabah_detail').insert({
      id: authData.user.id,
      rt: form.rt, rw: form.rw, kelurahan: form.kelurahan,
      kecamatan: form.kecamatan, kota: form.kota, provinsi: form.provinsi,
      kode_pos: form.kodePos, ktp_url: ktpPath, foto_selfie_url: selfiePath,
      foto_usaha_url: fotoUsahaPath, punya_usaha: form.punyaUsaha
    })

    alert('Pendaftaran Berhasil! Menunggu persetujuan Admin Koperasi.')
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-xl shadow-md font-sans">
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Registrasi Nasabah Koperasi</h2>
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-sm">{error}</div>}
      <form onSubmit={handleRegister} className="space-y-4">
        <input 
          type="text" placeholder="Kode Unik Koperasi (Contoh: KOP8A2X)" 
          className="w-full border p-2.5 rounded-lg text-sm uppercase font-semibold border-indigo-300 focus:ring-2 focus:ring-indigo-500"
          value={form.kodeKoperasi} onChange={e => setForm({...form, kodeKoperasi: e.target.value})} required 
        />
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Nama Lengkap KTP" className="border p-2.5 rounded-lg text-sm" onChange={e => setForm({...form, nama: e.target.value})} required />
          <input type="text" placeholder="NIK (16 Digit)" className="border p-2.5 rounded-lg text-sm" maxLength="16" onChange={e => setForm({...form, nik: e.target.value})} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input type="email" placeholder="Email Active" className="border p-2.5 rounded-lg text-sm" onChange={e => setForm({...form, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="border p-2.5 rounded-lg text-sm" onChange={e => setForm({...form, password: e.target.value})} required />
        </div>
        <input type="text" placeholder="Nomor Handphone (WhatsApp)" className="w-full border p-2.5 rounded-lg text-sm" onChange={e => setForm({...form, noHp: e.target.value})} required />
        <textarea placeholder="Alamat Detail Jalan/Gang" className="w-full border p-2.5 rounded-lg text-sm" onChange={e => setForm({...form, alamat: e.target.value})} required></textarea>
        
        <div className="grid grid-cols-3 gap-2">
          <input type="text" placeholder="RT" className="border p-2 rounded-lg text-sm" onChange={e => setForm({...form, rt: e.target.value})} />
          <input type="text" placeholder="RW" className="border p-2 rounded-lg text-sm" onChange={e => setForm({...form, rw: e.target.value})} />
          <input type="text" placeholder="Kode Pos" className="border p-2 rounded-lg text-sm" onChange={e => setForm({...form, kodePos: e.target.value})} />
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center space-x-2 text-sm text-slate-700 font-medium mb-3">
            <input type="checkbox" onChange={e => setForm({...form, punyaUsaha: e.target.checked})} className="rounded text-indigo-600" />
            <span>Memiliki Usaha Aktif?</span>
          </label>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Upload KTP (*Wajib)</label>
              <input type="file" onChange={e => setFiles({...files, ktp: e.target.files[0]})} required className="text-sm w-full" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Upload Foto Selfie / Selfie KTP (*Wajib)</label>
              <input type="file" onChange={e => setFiles({...files, selfie: e.target.files[0]})} required className="text-sm w-full" />
            </div>
            {form.punyaUsaha && (
              <div>
                <label className="block text-xs font-semibold mb-1">Upload Foto Usaha + Tampak Muka (*Wajib)</label>
                <input type="file" onChange={e => setFiles({...files, usaha: e.target.files[0]})} required className="text-sm w-full" />
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
          Daftar Nasabah Baru
        </button>
      </form>
    </div>
  )
}
