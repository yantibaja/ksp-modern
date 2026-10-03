import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-client'

// --- INISIALISASI SUPABASE CLIENT ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
  const [activeTab, setActiveTab] = useState('DASHBOARD') // DASHBOARD, APPROVAL, NASABAH, PINJAMAN, TIM, PENGATURAN, BAYAR_SAYA
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*, koperasi(*)')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      setSession(null)
      setProfile(null)
      setView('LOGIN')
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Memuat KSP Modern...</p>
        </div>
      </div>
    )
  }

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
      {/* Sidebar Navigasi */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="text-xl font-bold tracking-wider text-sky-400 mb-6 flex items-center gap-2">
            <span>🏦 KSP MODERN</span>
          </div>
          <div className="text-xs bg-slate-800 p-3 rounded-lg mb-4 border border-slate-700">
            <p className="text-slate-400">Pengguna: <span className="font-semibold text-white">{profile?.nama_lengkap}</span></p>
            <p className="text-slate-400 mt-1">Role: <span className="font-bold text-sky-400">{profile?.role}</span></p>
            <p className="text-slate-400 mt-1">Koperasi: <span className="font-semibold text-emerald-400">{profile?.koperasi?.nama || 'Super Admin Global'}</span></p>
          </div>

          <nav className="space-y-1 text-sm">
            <button 
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'DASHBOARD' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
            >
              📊 Dashboard
            </button>

            {['SUPER_ADMIN', 'ADMIN_KOPERASI'].includes(profile?.role) && (
              <>
                <button 
                  onClick={() => setActiveTab('APPROVAL')}
                  className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'APPROVAL' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  ✅ Approval Center
                </button>
                <button 
                  onClick={() => setActiveTab('NASABAH')}
                  className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'NASABAH' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  👥 Data Nasabah
                </button>
                <button 
                  onClick={() => setActiveTab('PINJAMAN')}
                  className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'PINJAMAN' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  💰 Pinjaman & Angsuran
                </button>
                <button 
                  onClick={() => setActiveTab('TIM')}
                  className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'TIM' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  👮 Kelola Tim Penagih
                </button>
                <button 
                  onClick={() => setActiveTab('PENGATURAN')}
                  className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'PENGATURAN' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  ⚙️ Pengaturan & Bank
                </button>
              </>
            )}

            {profile?.role === 'PENAGIH' && (
              <button 
                onClick={() => setActiveTab('DASHBOARD')}
                className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'DASHBOARD' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                📋 Daftar Tugas Tagih
              </button>
            )}

            {profile?.role === 'NASABAH' && (
              <button 
                onClick={() => setActiveTab('BAYAR_SAYA')}
                className={`w-full text-left py-2.5 px-3 rounded-lg font-medium transition ${activeTab === 'BAYAR_SAYA' ? 'bg-sky-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
              >
                💳 Tagihan & Pembayaran
              </button>
            )}
          </nav>
        </div>

        <button 
          onClick={handleLogout} 
          className="mt-8 w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-lg font-bold text-sm transition"
        >
          Keluar Aplikasi
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <HeaderBar profile={profile} />

        {profile?.status === 'PENDING' ? (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-lg mt-6 shadow-sm">
            <h3 className="font-bold text-amber-800 text-lg">Pendaftaran Anda Dalam Proses Tinjauan</h3>
            <p className="text-sm text-amber-700 mt-1">Akun Anda belum disetujui oleh Administrator. Silakan hubungi pengelola koperasi Anda untuk verifikasi data.</p>
          </div>
        ) : (
          <>
            {activeTab === 'DASHBOARD' && <DashboardView profile={profile} />}
            {activeTab === 'APPROVAL' && <ApprovalCenter profile={profile} />}
            {activeTab === 'BAYAR_SAYA' && <NasabahPembayaranView profile={profile} />}
            {activeTab === 'PENGATURAN' && <PengaturanAdminView profile={profile} />}
            {['NASABAH', 'PINJAMAN', 'TIM'].includes(activeTab) && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 mt-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-2">Modul {activeTab}</h2>
                <p className="text-slate-500 text-sm">Fitur manajemen {activeTab.toLowerCase()} berjalan dengan RLS Supabase secara langsung.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// --- FORM LOGIN ---
function LoginForm({ setView, fetchProfile }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      alert('Gagal Masuk: ' + error.message)
      setLoading(false)
    } else {
      fetchProfile(data.user.id)
    }
  }

  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-md border border-slate-700 shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-sky-400">Masuk KSP Modern</h2>
        <p className="text-xs text-slate-400 mt-1">Sistem Informasi Koperasi Simpan Pinjam</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-300">EMAIL</label>
          <input 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required 
            placeholder="nama@email.com"
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1 text-slate-300">PASSWORD</label>
          <input 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required 
            placeholder="••••••••"
            className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-3 bg-sky-500 hover:bg-sky-600 font-bold rounded-lg text-white transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'MASUK APLIKASI'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-700 text-center text-xs text-slate-400 space-y-3">
        <p>Belum memiliki akun? Silakan mendaftar:</p>
        <div className="flex justify-center gap-3 flex-wrap font-medium">
          <button onClick={()=>setView('REG_NASABAH')} className="text-sky-400 hover:underline">Daftar Nasabah</button>
          <span>•</span>
          <button onClick={()=>setView('REG_PENAGIH')} className="text-sky-400 hover:underline">Daftar Penagih</button>
          <span>•</span>
          <button onClick={()=>setView('REG_KOPERASI')} className="text-emerald-400 hover:underline">Daftar Koperasi</button>
        </div>
      </div>
    </div>
  )
}

// --- REGISTRASI KOPERASI ---
function RegisterKoperasi({ setView }) {
  const [form, setForm] = useState({ namaPemilik: '', nik: '', alamatPemilik: '', namaKoperasi: '', alamatKoperasi: '', noTelp: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    const kodeUnik = generateKodeKoperasi()
    
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authErr) {
      alert(authErr.message)
      setLoading(false)
      return
    }

    const { data: kopData, error: kopErr } = await supabase.from('koperasi').insert({
      kode_unik: kodeUnik,
      nama: form.namaKoperasi,
      alamat: form.alamatKoperasi,
      no_telp: form.noTelp,
      status: 'PENDING'
    }).select().single()

    if (kopErr) {
      alert(kopErr.message)
      setLoading(false)
      return
    }

    await supabase.from('profiles').insert({
      id: authData.user.id,
      koperasi_id: kopData.id,
      role: 'ADMIN_KOPERASI',
      nik: form.nik,
      no_hp: form.noTelp,
      nama_lengkap: form.namaPemilik,
      status: 'PENDING'
    })

    alert(`Pendaftaran Koperasi Berhasil!\nKode Unik Koperasi Anda: ${kodeUnik}\nStatus: Menunggu Persetujuan Super Admin.`)
    setLoading(false)
    setView('LOGIN')
  }

  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl my-8">
      <h2 className="text-xl font-bold mb-4 text-emerald-400">Registrasi Koperasi Baru</h2>
      <form onSubmit={handleRegister} className="space-y-3 text-sm">
        <input placeholder="Nama Pemilik/Pendiri" onChange={e=>setForm({...form, namaPemilik: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="NIK Pemilik" onChange={e=>setForm({...form, nik: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="Nama Koperasi" onChange={e=>setForm({...form, namaKoperasi: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="No Telp Koperasi" onChange={e=>setForm({...form, noTelp: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <textarea placeholder="Alamat Koperasi" onChange={e=>setForm({...form, alamatKoperasi: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input type="email" placeholder="Email Login Admin" onChange={e=>setForm({...form, email: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form, password: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Mendaftarkan...' : 'Daftar Koperasi'}
          </button>
          <button type="button" onClick={()=>setView('LOGIN')} className="px-4 bg-slate-700 text-slate-300 rounded-lg">Batal</button>
        </div>
      </form>
    </div>
  )
}

// --- REGISTRASI NASABAH ---
function RegisterNasabah({ setView }) {
  const [kodeKoperasi, setKodeKoperasi] = useState('')
  const [form, setForm] = useState({ nama: '', nik: '', noHp: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: kop, error: kopErr } = await supabase.from('koperasi').select('id').eq('kode_unik', kodeKoperasi.trim().toUpperCase()).single()
    if (kopErr || !kop) {
      alert('Kode Koperasi tidak valid atau tidak ditemukan!')
      setLoading(false)
      return
    }

    const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authErr) {
      alert(authErr.message)
      setLoading(false)
      return
    }

    await supabase.from('profiles').insert({
      id: authData.user.id,
      koperasi_id: kop.id,
      role: 'NASABAH',
      nik: form.nik,
      no_hp: form.noHp,
      nama_lengkap: form.nama,
      status: 'PENDING'
    })

    alert('Pendaftaran Nasabah Berhasil! Menunggu persetujuan Admin Koperasi.')
    setLoading(false)
    setView('LOGIN')
  }

  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl my-8">
      <h2 className="text-xl font-bold mb-4 text-sky-400">Registrasi Nasabah Baru</h2>
      <form onSubmit={handleRegister} className="space-y-3 text-sm">
        <div>
          <label className="block text-xs text-amber-400 mb-1 font-bold">KODE UNIK KOPERASI</label>
          <input placeholder="Contoh: KOP8A2X" value={kodeKoperasi} onChange={e=>setKodeKoperasi(e.target.value)} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-amber-500 text-amber-400 font-bold uppercase tracking-wider"/>
        </div>
        <input placeholder="Nama Lengkap Sesuai KTP" onChange={e=>setForm({...form, nama: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="NIK (16 Digit)" onChange={e=>setForm({...form, nik: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="No WhatsApp/HP" onChange={e=>setForm({...form, noHp: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input type="email" placeholder="Email" onChange={e=>setForm({...form, email: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form, password: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Mendaftarkan...' : 'Daftar Nasabah'}
          </button>
          <button type="button" onClick={()=>setView('LOGIN')} className="px-4 bg-slate-700 text-slate-300 rounded-lg">Batal</button>
        </div>
      </form>
    </div>
  )
}

// --- REGISTRASI PENAGIH ---
function RegisterPenagih({ setView }) {
  const [kodeKoperasi, setKodeKoperasi] = useState('')
  const [form, setForm] = useState({ nama: '', nik: '', noHp: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: kop, error: kopErr } = await supabase.from('koperasi').select('id').eq('kode_unik', kodeKoperasi.trim().toUpperCase()).single()
    if (kopErr || !kop) {
      alert('Kode Koperasi tidak valid!')
      setLoading(false)
      return
    }

    const { data: authData, error: authErr } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (authErr) {
      alert(authErr.message)
      setLoading(false)
      return
    }

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
    setLoading(false)
    setView('LOGIN')
  }

  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-lg border border-slate-700 shadow-2xl my-8">
      <h2 className="text-xl font-bold mb-4 text-amber-400">Registrasi Petugas Penagih</h2>
      <form onSubmit={handleRegister} className="space-y-3 text-sm">
        <div>
          <label className="block text-xs text-amber-400 mb-1 font-bold">KODE UNIK KOPERASI</label>
          <input placeholder="Contoh: KOP8A2X" value={kodeKoperasi} onChange={kodeKoperasi} onChange={e=>setKodeKoperasi(e.target.value)} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-amber-500 text-amber-400 font-bold uppercase tracking-wider"/>
        </div>
        <input placeholder="Nama Lengkap" onChange={e=>setForm({...form, nama: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="NIK" onChange={e=>setForm({...form, nik: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input placeholder="No HP/WA" onChange={e=>setForm({...form, noHp: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input type="email" placeholder="Email" onChange={e=>setForm({...form, email: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <input type="password" placeholder="Password" onChange={e=>setForm({...form, password: e.target.value})} required className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"/>
        <div className="flex gap-2 pt-2">
          <button type="submit" disabled={loading} className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50">
            {loading ? 'Mendaftarkan...' : 'Daftar Penagih'}
          </button>
          <button type="button" onClick={()=>setView('LOGIN')} className="px-4 bg-slate-700 text-slate-300 rounded-lg">Batal</button>
        </div>
      </form>
    </div>
  )
}

// --- HEADER & DASHBOARD ---
function HeaderBar({ profile }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-slate-200 gap-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Selamat Datang, {profile?.nama_lengkap}</h1>
        <p className="text-xs text-slate-500">KSP Management Dashboard App</p>
      </div>
      {profile?.koperasi?.kode_unik && (
        <div className="bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1.5 rounded-full text-xs font-bold">
          Kode Koperasi: <span className="text-sky-900 font-extrabold">{profile.koperasi.kode_unik}</span>
        </div>
      )}
    </div>
  )
}

function DashboardView({ profile }) {
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Nasabah</span>
          <div className="text-2xl font-bold text-slate-800 mt-1">128 Orang</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pinjaman Aktif</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">Rp 450.000.000</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Tunggakan</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">Rp 12.500.000</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pemasukan Hari Ini</span>
          <div className="text-2xl font-bold text-sky-600 mt-1">Rp 3.200.000</div>
        </div>
      </div>

      {/* WhatsApp Integration Direct Action */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-bold text-emerald-900 text-base">Broadcast Marketing & Penagihan WhatsApp</h3>
          <p className="text-xs text-emerald-700 mt-0.5">Kirim pengingat tagihan instan langsung ke WhatsApp nasabah yang terdaftar.</p>
        </div>
        <button 
          onClick={() => {
            const phone = "6281234567890"
            const text = encodeURIComponent("Halo, kami dari KSP Modern mengingatkan jadwal angsuran pinjaman Anda. Silakan bayar melalui aplikasi via QRIS/Transfer Bank.")
            window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition shrink-0"
        >
          📲 Tagih via WhatsApp API
        </button>
      </div>
    </div>
  )
}

// --- APPROVAL CENTER ---
function ApprovalCenter({ profile }) {
  const [pendingList, setPendingList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    setLoading(true)
    let query = supabase.from('profiles').select('*').eq('status', 'PENDING')
    
    if (profile.role === 'ADMIN_KOPERASI') {
      query = query.eq('koperasi_id', profile.koperasi_id)
    }

    const { data, error } = await query
    if (!error) setPendingList(data || [])
    setLoading(false)
  }

  const handleApprove = async (id, status) => {
    const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
    if (error) alert(error.message)
    else {
      alert(`Status pendaftaran berhasil diperbarui menjadi ${status}`)
      fetchPendingUsers()
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 mt-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 mb-4">Approval Center (Persetujuan Pendaftaran)</h2>
      {loading ? (
        <p className="text-sm text-slate-500">Memuat data pendaftar...</p>
      ) : pendingList.length === 0 ? (
        <p className="text-sm text-slate-500">Tidak ada pendaftaran baru yang menunggu persetujuan.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th className="p-3">Nama Lengkap</th>
                <th className="p-3">Role</th>
                <th className="p-3">NIK</th>
                <th className="p-3">No HP</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingList.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-800">{user.nama_lengkap}</td>
                  <td className="p-3"><span className="bg-sky-100 text-sky-800 px-2 py-0.5 rounded text-xs font-bold">{user.role}</span></td>
                  <td className="p-3">{user.nik}</td>
                  <td className="p-3">{user.no_hp}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleApprove(user.id, 'APPROVED')} className="bg-emerald-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-700">Setujui</button>
                    <button onClick={() => handleApprove(user.id, 'REJECTED')} className="bg-rose-600 text-white text-xs px-3 py-1.5 rounded-lg font-bold hover:bg-rose-700">Tolak</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// --- PEMBAYARAN NASABAH (QRIS MIDTRANS & TRANSFER BANK) ---
function NasabahPembayaranView({ profile }) {
  const [metode, setMetode] = useState('QRIS') // QRIS atau TRANSFER
  const [jumlahBayar] = useState(500000) // Contoh nominal angsuran
  const [bankList, setBankList] = useState([])
  const [qrisUrl, setQrisUrl] = useState(null)
  const [loadingQris, setLoadingQris] = useState(false)

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    const { data } = await supabase.from('bank_accounts').select('*').eq('koperasi_id', profile.koperasi_id)
    setBankList(data || [])
  }

  const handleGenerateQRIS = async () => {
    setLoadingQris(true)
    try {
      const orderId = `KSP-ANGS-${profile.id}-${Date.now()}`

      // Memanggil Supabase Edge Function 'create-qris' yang menyimpan Server Key Midtrans secara aman
      const { data, error } = await supabase.functions.invoke('create-qris', {
        body: {
          order_id: orderId,
          gross_amount: jumlahBayar,
          customer_details: {
            first_name: profile.nama_lengkap,
            phone: profile.no_hp
          }
        }
      })

      if (error) throw error

      const qrisAction = data.actions?.find(action => action.name === 'generate-qr-code')
      if (qrisAction) {
        setQrisUrl(qrisAction.url)
      } else {
        alert('Gagal mengambil QRIS dari Midtrans.')
      }
    } catch (err) {
      alert('Error saat membuat QRIS: ' + err.message)
    } finally {
      setLoadingQris(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 mt-6 shadow-sm max-w-2xl">
      <h2 className="text-lg font-bold text-slate-800 mb-1">Pembayaran Angsuran Pinjaman</h2>
      <p className="text-slate-500 text-xs mb-6">Pilih metode pembayaran resmi di bawah ini:</p>

      <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100 flex justify-between items-center">
        <span className="text-sm text-slate-600 font-medium">Tagihan Angsuran Ke-1</span>
        <span className="text-lg font-bold text-emerald-600">Rp {jumlahBayar.toLocaleString('id-ID')}</span>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setMetode('QRIS')} 
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition ${metode === 'QRIS' ? 'bg-sky-50 border-sky-500 text-sky-600' : 'border-slate-200 text-slate-600'}`}
        >
          📱 QRIS Instant
        </button>
        <button 
          onClick={() => setMetode('TRANSFER')} 
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition ${metode === 'TRANSFER' ? 'bg-sky-50 border-sky-500 text-sky-600' : 'border-slate-200 text-slate-600'}`}
        >
          🏦 Transfer Bank
        </button>
      </div>

      {metode === 'QRIS' && (
        <div className="text-center p-4 border border-slate-100 rounded-xl bg-slate-50">
          {!qrisUrl ? (
            <button 
              onClick={handleGenerateQRIS} 
              disabled={loadingQris}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loadingQris ? 'Memuat Kode QRIS...' : 'Tampilkan Kode QRIS'}
            </button>
          ) : (
            <div className="flex flex-col items-center">
              <p className="text-xs text-slate-500 mb-3">Scan kode QRIS di bawah ini menggunakan GoPay, OVO, Dana, ShopeePay, atau Bank App:</p>
              <img src={qrisUrl} alt="Kode QRIS" className="w-60 h-60 border-2 border-slate-300 rounded-xl p-2 bg-white shadow-md"/>
            </div>
          )}
        </div>
      )}

      {metode === 'TRANSFER' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Transfer tepat sesuai nominal ke salah satu rekening resmi berikut:</p>
          {bankList.length === 0 ? (
            <div className="p-4 bg-slate-50 border rounded-lg text-xs text-slate-500">Belum ada Rekening Bank yang ditambahkan oleh Admin Koperasi.</div>
          ) : (
            bankList.map(bank => (
              <div key={bank.id} className="p-4 border border-slate-200 rounded-xl bg-slate-50">
                <p className="font-bold text-slate-800 text-sm">{bank.nama_bank}</p>
                <p className="text-lg font-mono font-bold text-sky-600">{bank.no_rekening}</p>
                <p className="text-xs text-slate-500">a.n {bank.pemilik_rekening}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// --- PENGATURAN ADMIN (CRUD BANK) ---
function PengaturanAdminView({ profile }) {
  const [bankList, setBankList] = useState([])
  const [form, setForm] = useState({ namaBank: '', noRekening: '', pemilikRekening: '' })

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    const { data } = await supabase.from('bank_accounts').select('*').eq('koperasi_id', profile.koperasi_id)
    setBankList(data || [])
  }

  const handleAddBank = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('bank_accounts').insert({
      koperasi_id: profile.koperasi_id,
      nama_bank: form.namaBank,
      no_rekening: form.noRekening,
      pemilik_rekening: form.pemilikRekening
    })

    if (error) alert(error.message)
    else {
      alert('Rekening Bank Berhasil Ditambahkan')
      setForm({ namaBank: '', noRekening: '', pemilikRekening: '' })
      fetchBankAccounts()
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 mt-6 shadow-sm max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">Pengaturan Akun Rekening Bank</h2>
        <p className="text-xs text-slate-500">Tambah rekening bank untuk penerimaan pembayaran metode Transfer Nasabah.</p>
      </div>

      <form onSubmit={handleAddBank} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Nama Bank (misal: BCA)" value={form.namaBank} onChange={e=>setForm({...form, namaBank: e.target.value})} required className="p-2.5 border rounded-lg text-sm"/>
        <input placeholder="No Rekening" value={form.noRekening} onChange={e=>setForm({...form, noRekening: e.target.value})} required className="p-2.5 border rounded-lg text-sm"/>
        <input placeholder="Atas Nama (a.n)" value={form.pemilikRekening} onChange={e=>setForm({...form, pemilikRekening: e.target.value})} required className="p-2.5 border rounded-lg text-sm"/>
        <button type="submit" className="sm:col-span-3 bg-sky-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-sky-700">Tambah Rekening Bank</button>
      </form>

      <div className="divide-y divide-slate-100 border-t pt-4">
        {bankList.map(b => (
          <div key={b.id} className="py-3 flex justify-between items-center text-sm">
            <div>
              <p className="font-bold text-slate-800">{b.nama_bank} - {b.no_rekening}</p>
              <p className="text-xs text-slate-500">a.n {b.pemilik_rekening}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
      }
