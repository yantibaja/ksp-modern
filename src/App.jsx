import React, { useState, Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'

// ==========================================
// 1. ERROR BOUNDARY (Mencegah Layar Putih)
// ==========================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Aplikasi Error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#ef4444' }}>Terjadi Kesalahan Sistem</h2>
          <p style={{ color: '#64748b' }}>{this.state.error?.toString()}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ==========================================
// 2. DATA DUMMY AWAL
// ==========================================
const initialAnggota = [
  { id: 'KSP-001', nama: 'Budi Santoso', noKtp: '5303012304850001', telepon: '081234567890', simpanan: 5000000, status: 'Aktif' },
  { id: 'KSP-002', nama: 'Siti Aminah', noKtp: '5303015508920002', telepon: '082198765432', simpanan: 3500000, status: 'Aktif' },
  { id: 'KSP-003', nama: 'YOHANES RIWU', noKtp: '5303011211780003', telepon: '085239123456', simpanan: 12000000, status: 'Aktif' },
]

const initialPinjaman = [
  { id: 'P-101', nama: 'YOHANES RIWU', jumlah: 10000000, tenor: 12, sisaTenor: 8, angsuran: 950000, status: 'Berjalan' },
  { id: 'P-102', nama: 'Siti Aminah', jumlah: 3000000, tenor: 6, sisaTenor: 2, angsuran: 550000, status: 'Berjalan' },
  { id: 'P-103', nama: 'Budi Santoso', jumlah: 5000000, tenor: 10, sisaTenor: 0, angsuran: 550000, status: 'Lunas' },
]

// ==========================================
// 3. HALAMAN DASHBOARD
// ==========================================
function Dashboard({ anggota, pinjaman }) {
  const totalSimpanan = anggota.reduce((acc, curr) => acc + curr.simpanan, 0)
  const totalPinjamanAktif = pinjaman
    .filter(p => p.status === 'Berjalan')
    .reduce((acc, curr) => acc + curr.jumlah, 0)

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Dashboard Ringkasan</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Sistem Informasi Koperasi Simpan Pinjam Modern</p>
      </div>

      {/* Grid Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={cardStyle}>
          <span style={cardTitleStyle}>Total Anggota</span>
          <div style={cardValueStyle}>{anggota.length} Orang</div>
          <span style={{ fontSize: '12px', color: '#16a34a' }}>● Semua terverifikasi</span>
        </div>
        <div style={cardStyle}>
          <span style={cardTitleStyle}>Total Kas Simpanan</span>
          <div style={{ ...cardValueStyle, color: '#2563eb' }}>Rp {totalSimpanan.toLocaleString('id-ID')}</div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Simpanan Pokok & Wajib</span>
        </div>
        <div style={cardStyle}>
          <span style={cardTitleStyle}>Pinjaman Aktif</span>
          <div style={{ ...cardValueStyle, color: '#d97706' }}>Rp {totalPinjamanAktif.toLocaleString('id-ID')}</div>
          <span style={{ fontSize: '12px', color: '#64748b' }}>{pinjaman.filter(p => p.status === 'Berjalan').length} Transaksi Berjalan</span>
        </div>
      </div>

      {/* Tabel Aktivitas / Pinjaman Terbaru */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>Pinjaman Terbaru</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Peminjam</th>
                <th style={{ padding: '12px' }}>Jumlah</th>
                <th style={{ padding: '12px' }}>Angsuran/Bln</th>
                <th style={{ padding: '12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {pinjaman.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.id}</td>
                  <td style={{ padding: '12px' }}>{p.nama}</td>
                  <td style={{ padding: '12px' }}>Rp {p.jumlah.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '12px' }}>Rp {p.angsuran.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: p.status === 'Berjalan' ? '#fef3c7' : '#dcfce7',
                      color: p.status === 'Berjalan' ? '#d97706' : '#16a34a'
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. HALAMAN DATA ANGGOTA
// ==========================================
function Anggota({ anggota, setAnggota }) {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nama: '', noKtp: '', telepon: '', simpanan: '' })

  const filtered = anggota.filter(a => 
    a.nama.toLowerCase().includes(search.toLowerCase()) || 
    a.noKtp.includes(search)
  )

  const handleTambah = (e) => {
    e.preventDefault()
    if (!form.nama || !form.noKtp) return alert('Nama dan No KTP wajib diisi!')
    
    const newAnggota = {
      id: `KSP-00${anggota.length + 1}`,
      nama: form.nama,
      noKtp: form.noKtp,
      telepon: form.telepon || '-',
      simpanan: Number(form.simpanan) || 0,
      status: 'Aktif'
    }

    setAnggota([...anggota, newAnggota])
    setForm({ nama: '', noKtp: '', telepon: '', simpanan: '' })
    setShowModal(false)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Data Anggota</h1>
          <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Kelola daftar anggota resmi KSP</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          + Tambah Anggota
        </button>
      </div>

      {/* Search Bar */}
      <input 
        type="text" 
        placeholder="Cari nama atau No. KTP..." 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}
      />

      {/* Modal Tambah Anggota */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px' }}>
            <h3 style={{ marginTop: 0 }}>Tambah Anggota Baru</h3>
            <form onSubmit={handleTambah} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input type="text" placeholder="Nama Lengkap" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} style={inputStyle} required />
              <input type="text" placeholder="No. KTP / NIK" value={form.noKtp} onChange={e => setForm({...form, noKtp: e.target.value})} style={inputStyle} required />
              <input type="text" placeholder="No. WhatsApp / Telepon" value={form.telepon} onChange={e => setForm({...form, telepon: e.target.value})} style={inputStyle} />
              <input type="number" placeholder="Simpanan Awal (Rp)" value={form.simpanan} onChange={e => setForm({...form, simpanan: e.target.value})} style={inputStyle} />
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button type="submit" style={{ flex: 1, backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Simpan</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, backgroundColor: '#94a3b8', color: '#fff', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer' }}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel Anggota */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px' }}>ID</th>
              <th style={{ padding: '14px' }}>Nama</th>
              <th style={{ padding: '14px' }}>No. KTP</th>
              <th style={{ padding: '14px' }}>Telepon</th>
              <th style={{ padding: '14px' }}>Total Simpanan</th>
              <th style={{ padding: '14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px', fontWeight: 'bold' }}>{a.id}</td>
                <td style={{ padding: '14px' }}>{a.nama}</td>
                <td style={{ padding: '14px' }}>{a.noKtp}</td>
                <td style={{ padding: '14px' }}>{a.telepon}</td>
                <td style={{ padding: '14px', fontWeight: 'bold', color: '#16a34a' }}>Rp {a.simpanan.toLocaleString('id-ID')}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 'bold' }}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==========================================
// 5. HALAMAN PINJAMAN & SIMULASI
// ==========================================
function Pinjaman({ pinjaman, setPinjaman, anggota }) {
  const [jumlah, setJumlah] = useState(5000000)
  const [tenor, setTenor] = useState(12)
  const bunga = 0.01 // Bunga 1% per bulan

  const angsuranPerBulan = Math.round((jumlah / tenor) + (jumlah * bunga))

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#0f172a' }}>Manajemen Pinjaman</h1>
        <p style={{ margin: '4px 0 0 0', color: '#64748b' }}>Simulasi angsuran dan daftar pinjaman aktif</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Kalkulator Simulasi */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ marginTop: 0, color: '#0f172a' }}>Simulasi Kalkulator Pinjaman</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Jumlah Pinjaman (Rp)</label>
              <input type="number" value={jumlah} onChange={e => setJumlah(Number(e.target.value))} style={inputStyle} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#64748b' }}>Tenor (Bulan)</label>
              <select value={tenor} onChange={e => setTenor(Number(e.target.value))} style={inputStyle}>
                <option value={6}>6 Bulan</option>
                <option value={12}>12 Bulan</option>
                <option value={24}>24 Bulan</option>
              </select>
            </div>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Estimasi Angsuran / Bulan:</span>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                Rp {angsuranPerBulan.toLocaleString('id-ID')}
              </div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>*Bunga flat 1% / bulan</span>
            </div>
          </div>
        </div>

        {/* Info Ringkasan Pinjaman */}
        <div style={{ background: '#1e293b', color: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ marginTop: 0 }}>Ketentuan Pinjaman KSP</h3>
          <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1' }}>
            <li>Peminjam harus terdaftar sebagai anggota aktif.</li>
            <li>Batas maksimum pinjaman berdasarkan jumlah simpanan.</li>
            <li>Pencairan dana diproses maksimal 1x24 jam kerja.</li>
          </ul>
        </div>
      </div>

      {/* Tabel Pinjaman */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px' }}>ID</th>
              <th style={{ padding: '14px' }}>Nama Peminjam</th>
              <th style={{ padding: '14px' }}>Plafon Pinjaman</th>
              <th style={{ padding: '14px' }}>Tenor</th>
              <th style={{ padding: '14px' }}>Sisa Tenor</th>
              <th style={{ padding: '14px' }}>Angsuran</th>
              <th style={{ padding: '14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {pinjaman.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px', fontWeight: 'bold' }}>{p.id}</td>
                <td style={{ padding: '14px' }}>{p.nama}</td>
                <td style={{ padding: '14px' }}>Rp {p.jumlah.toLocaleString('id-ID')}</td>
                <td style={{ padding: '14px' }}>{p.tenor} Bln</td>
                <td style={{ padding: '14px' }}>{p.sisaTenor} Bln</td>
                <td style={{ padding: '14px', fontWeight: 'bold' }}>Rp {p.angsuran.toLocaleString('id-ID')}</td>
                <td style={{ padding: '14px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                    backgroundColor: p.status === 'Berjalan' ? '#fef3c7' : '#dcfce7',
                    color: p.status === 'Berjalan' ? '#d97706' : '#16a34a'
                  }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Navigasi Bar Aktif Component
function NavigationBar() {
  const location = useLocation()
  const isActive = (path) => location.pathname === path

  const navLinkStyle = (path) => ({
    color: isActive(path) ? '#38bdf8' : '#f8fafc',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: isActive(path) ? 'rgba(255,255,255,0.1)' : 'transparent'
  })

  return (
    <nav style={{ backgroundColor: '#0f172a', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <strong style={{ color: '#ffffff', fontSize: '18px', marginRight: '16px' }}>KSP Modern</strong>
      <Link to="/" style={navLinkStyle('/')}>Dashboard</Link>
      <Link to="/anggota" style={navLinkStyle('/anggota')}>Anggota</Link>
      <Link to="/pinjaman" style={navLinkStyle('/pinjaman')}>Pinjaman</Link>
    </nav>
  )
}

// ==========================================
// 6. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [anggota, setAnggota] = useState(initialAnggota)
  const [pinjaman, setPinjaman] = useState(initialPinjaman)

  return (
    <ErrorBoundary>
      <Router basename="/ksp-modern">
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
          <NavigationBar />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard anggota={anggota} pinjaman={pinjaman} />} />
              <Route path="/anggota" element={<Anggota anggota={anggota} setAnggota={setAnggota} />} />
              <Route path="/pinjaman" element={<Pinjaman pinjaman={pinjaman} setPinjaman={setPinjaman} anggota={anggota} />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  )
}

// Styles Helper
const cardStyle = { background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }
const cardTitleStyle = { fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }
const cardValueStyle = { fontSize: '24px', fontWeight: 'bold', margin: '8px 0', color: '#0f172a' }
const inputStyle = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }
                  
