import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// --- HELPER UNTUK GENERATE KODE KOPERASI ---
const generateKodeKoperasi = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = 'KOP'
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [view, setView] = useState('LOGIN') // LOGIN, REG_KOPERASI, REG_NASABAH, REG_PENAGIH
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*, koperasi(*)').eq('id', userId).single()
    setProfile(data)
  }

  const handleLogout = () => supabase.auth.signOut().then(() => { setSession(null); setProfile(null) })

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans">
        {view === 'LOGIN' && <LoginForm setView={setView} fetchProfile={fetchProfile} />}
        {view === 'REG_KOPERASI' && <RegisterKoperasi setView={setView} />}
        {view === 'REG_NASABAH' && <RegisterNasabah setView={setView} />}
        {view === 'REG_PENAGIH' && <RegisterPenagih setView={setView} />}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 p-4 flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold tracking-wider text-sky-400 mb-6 flex items-center gap-2">
            <span>KSP MODERN</span>
          </div>
          <div className="text-xs text-slate-400 mb-4 pb-2 border-b border-slate-800">
            Role: <span className="font-semibold text-white">{profile?.role}</span><br/>
            Koperasi: <span className="font-semibold text-white">{profile?.koperasi?.nama || '-'}</span>
          </div>
          <nav className="space-y-2">
            <button className="w-full text-left py-2 px-3 rounded bg-slate-800 text-white font-medium">Dashboard</button>
            {['SUPER_ADMIN', 'ADMIN_KOPERASI'].includes(profile?.role) && (
              <>
                <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Approval Center</button>
                <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Data Nasabah</button>
                <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Manajemen Pinjaman</button>
                <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Kelola Tim Penagih</button>
                <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Pengaturan & Bank</button>
              </>
            )}
            {profile?.role === 'PENAGIH' && (
              <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Tugas Penagihan</button>
            )}
            {profile?.role === 'NASABAH' && (
              <button className="w-full text-left py-2 px-3 rounded hover:bg-slate-800 text-slate-300">Pinjaman Saya & Bayar</button>
            )}
          </nav>
        </div>
        <button onClick={handleLogout} className="mt-8 w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded font-medium">
          Keluar
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <HeaderBar profile={profile} />
        {profile?.status === 'PENDING' ? (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mt-4">
            <p className="font-semibold text-amber-800">Akun Anda Menunggu Persetujuan</p>
            <p className="text-sm text-amber-700">Pendaftaran Anda sedang ditinjau oleh Admin/Super Admin.</p>
          </div>
        ) : (
          <DashboardMain profile={profile} />
        )}
      </main>
    </div>
  )
}

// --- FORM LOGIN ---
function LoginForm({ setView, fetchProfile }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    else fetchProfile(data.user.id)
  }

  return (
    <div className="bg-slate-800 p-8 rounded-xl w-full max-w-md border border-slate-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-sky-400">Masuk KSP Modern</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-300">EMAIL / TELEPON</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"/>
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-300">PASSWORD</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-2.5 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-sky-500"/>
        </div>
        <button type="submit" className="w-full py-3 bg-sky-500 hover:bg-sky-600 font-bold rounded text-white transition">MASUK</button>
      </form>
      <div className="mt-6 pt-4 border-t border-slate-700 text-center text-xs text-slate-400 space-y-2">
        <p>Belum punya akun?</p>
        <div className="flex justify-center gap-2 flex-wrap">
          <button onClick={()=>setView('REG_NASABAH')} className="text-sky-400 underline">Daftar Nasabah</button>
          <span>•</span>
          <button onClick={()=>setView('REG_PENAGIH')} className="text-sky-400 underline">Daftar Penagih</button>
          <span>•</span>
          <button onClick={()=>setView('REG_KOPERASI')} className="text-emerald-400 underline">Daftar Koperasi</button>
        </div>
      </div>
    </div>
  )
}

// --- REGISTRASI KOPERASI BARU ---
function RegisterKoperasi({ setView }) {
  const [form, setForm] = useState({ namaPemilik: '', nik: '', alamatPemilik: '', namaKoperasi: '', alamatKoperasi: '', noTelp: '', email: '', password: '' })

  const handleRegister = async (e) => {
    e.preventDefault()
    const kodeUnik = generateKodeKoperasi()
    
    // 1. SignUp User
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authErr) return alert(authErr.message)

    // 2. Insert Koperasi
    const { data: kopData, error: kopErr } = await supabase.from('koperasi').insert({
      kode_unik: kodeUnik,
      nama: form.namaKoperasi,
      alamat: form.alamatKoperasi,
      no_telp: form.noTelp,
      status: 'PENDING'
    }).select().single()

    if (kopErr) return alert(kopErr.message)

    // 3. Insert Profile Admin Koperasi
    await supabase.from('profiles').insert({
      id: authData.user.id,
      koperasi_id: kopData.id,
      role: 'ADMIN_KOPERASI',
      nik: form.nik,
      no_hp: form.noTelp,
      nama_lengkap: form.namaPemilik,
      status: 'PENDING'
    })

    alert(`Pendaftaran Koperasi Berhasil!\nKode Unik Koperasi Anda: ${kodeUnik}\nStatus: Menunggu Approve Super Admin.`)
    setView('LOGIN')
  }

  return (
    <div className="bg-slate-800 p-8 rounded-xl w-full max-w-lg border border-slate-700 my-8">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Registrasi Koperasi Baru</h2>
      <form onSubmit={handleRegister} className="space-y-3 text-sm">
        <input placeholder="Nama Pemilik/Pendiri" onChange={e=>setForm({...form, namaPemilik: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="NIK Pemilik" onChange={e=>setForm({...form, nik: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="Nama Koperasi" onChange={e=>setForm({...form, namaKoperasi: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="No Telp Koperasi" onChange={e=>setForm({...form, noTelp: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <textarea placeholder="Alamat Koperasi" onChange={e=>setForm({...form, alamatKoperasi: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input type="email" placeholder="Email Akun Login" onChange={e=>setForm({...form, email: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form, password: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-bold py-2 rounded">Daftar Koperasi</button>
          <button type="button" onClick={()=>setView('LOGIN')} className="px-4 bg-slate-700 rounded">Batal</button>
        </div>
      </form>
    </div>
  )
}

// --- REGISTRASI NASABAH (SELF-REGISTRATION) ---
function RegisterNasabah({ setView }) {
  const [kodeKoperasi, setKodeKoperasi] = useState('')
  const [form, setForm] = useState({ nama: '', nik: '', noHp: '', email: '', password: '', alamat: '' })

  const handleRegister = async (e) => {
    e.preventDefault()
    // Validasi Kode Koperasi
    const { data: kop } = await supabase.from('koperasi').select('id').eq('kode_unik', kodeKoperasi.toUpperCase()).single()
    if (!kop) return alert('Kode Koperasi tidak ditemukan/salah!')

    const { data: authData, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) return alert(error.message)

    await supabase.from('profiles').insert({
      id: authData.user.id,
      koperasi_id: kop.id,
      role: 'NASABAH',
      nik: form.nik,
      no_hp: form.noHp,
      nama_lengkap: form.nama,
      status: 'PENDING'
    })

    alert('Pendaftaran Nasabah Berhasil! Menunggu persetujuan Admin.')
    setView('LOGIN')
  }

  return (
    <div className="bg-slate-800 p-8 rounded-xl w-full max-w-lg border border-slate-700 my-8">
      <h2 className="text-xl font-bold mb-4 text-sky-400">Registrasi Nasabah</h2>
      <form onSubmit={handleRegister} className="space-y-3 text-sm">
        <input placeholder="KODE KOPERASI (Contoh: KOP8A2X)" value={kodeKoperasi} onChange={e=>setKodeKoperasi(e.target.value)} required className="w-full p-2 rounded bg-slate-900 border border-amber-500 font-bold tracking-widest text-amber-400 uppercase"/>
        <input placeholder="Nama Lengkap sesuai KTP" onChange={e=>setForm({...form, nama: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="NIK (16 Digit)" onChange={e=>setForm({...form, nik: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="No WhatsApp/HP" onChange={e=>setForm({...form, noHp: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input type="email" placeholder="Email" onChange={e=>setForm({...form, email: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form, password: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-sky-600 hover:bg-sky-700 font-bold py-2 rounded">Daftar Nasabah</button>
          <button type="button" onClick={()=>setView('LOGIN')} className="px-4 bg-slate-700 rounded">Batal</button>
        </div>
      </form>
    </div>
  )
}

// --- REGISTRASI PENAGIH (SELF-REGISTRATION) ---
function RegisterPenagih({ setView }) {
  const [kodeKoperasi, setKodeKoperasi] = useState('')
  const [form, setForm] = useState({ nama: '', nik: '', noHp: '', email: '', password: '' })

  const handleRegister = async (e) => {
    e.preventDefault()
    const { data: kop } = await supabase.from('koperasi').select('id').eq('kode_unik', kodeKoperasi.toUpperCase()).single()
    if (!kop) return alert('Kode Koperasi tidak valid!')

    const { data: authData, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) return alert(error.message)

    await supabase.from('profiles').insert({
      id: authData.user.id,
      koperasi_id: kop.id,
      role: 'PENAGIH',
      nik: form.nik,
      no_hp: form.noHp,
      nama_lengkap: form.nama,
      status: 'PENDING'
    })

    alert('Pendaftaran Penagih Berhasil! Menunggu persetujuan Admin Koperasi.')
    setView('LOGIN')
  }

  return (
    <div className="bg-slate-800 p-8 rounded-xl w-full max-w-lg border border-slate-700 my-8">
      <h2 className="text-xl font-bold mb-4 text-amber-400">Registrasi Lapangan / Penagih</h2>
      <form onSubmit={handleRegister} className="space-y-3 text-sm">
        <input placeholder="KODE KOPERASI (Contoh: KOP8A2X)" value={kodeKoperasi} onChange={e=>setKodeKoperasi(e.target.value)} required className="w-full p-2 rounded bg-slate-900 border border-amber-500 font-bold tracking-widest text-amber-400 uppercase"/>
        <input placeholder="Nama Lengkap" onChange={e=>setForm({...form, nama: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="NIK KTP" onChange={e=>setForm({...form, nik: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input placeholder="No HP/WA" onChange={e=>setForm({...form, noHp: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input type="email" placeholder="Email" onChange={e=>setForm({...form, email: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form, password: e.target.value})} required className="w-full p-2 rounded bg-slate-900 border border-slate-700"/>
        <div className="flex gap-2 pt-2">
          <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700 font-bold py-2 rounded">Daftar Penagih</button>
          <button type="button" onClick={()=>setView('LOGIN')} className="px-4 bg-slate-700 rounded">Batal</button>
        </div>
      </form>
    </div>
  )
}

// --- HEADER & DASHBOARD UTAMA ---
function HeaderBar({ profile }) {
  return (
    <div className="flex justify-between items-center pb-4 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Halo, {profile?.nama_lengkap}</h1>
        <p className="text-xs text-slate-500">Aplikasi Sistem Koperasi Simpan Pinjam Modern</p>
      </div>
      {profile?.koperasi?.kode_unik && (
        <div className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-xs font-bold border border-sky-300">
          Kode Koperasi: {profile.koperasi.kode_unik}
        </div>
      )}
    </div>
  )
}

function DashboardMain({ profile }) {
  return (
    <div className="mt-6 space-y-6">
      {/* Cards Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Nasabah</span>
          <div className="text-2xl font-bold text-slate-800 mt-1">128 Orang</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Pinjaman Aktif</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Rp 450.000.000</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Tunggakan</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">Rp 12.500.000</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase">Pemasukan Hari Ini</span>
          <div className="text-2xl font-bold text-sky-600 mt-1">Rp 3.200.000</div>
        </div>
      </div>

      {/* Integrasi WhatsApp Direct Action */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center">
        <div>
          <h3 className="font-bold text-emerald-900">Broadcast Marketing & Penagihan WA</h3>
          <p className="text-xs text-emerald-700">Kirim notifikasi otomatis atau pengingat angsuran lewat WhatsApp API</p>
        </div>
        <button 
          onClick={() => {
            const phone = "6281234567890"
            const text = encodeURIComponent("Halo Budi, tagihan pinjaman KSP Anda sebesar Rp 500.000 jatuh tempo pada tanggal 5. Silakan lakukan pembayaran via QRIS/Transfer.")
            window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
        >
          Kirim Penagihan WA
        </button>
      </div>
    </div>
  )
}
                                                                  
