import React, { Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

// ==========================================
// 1. ERROR BOUNDARY (Penjaga dari Layar Putih)
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
        <div style={{ padding: '30px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#e11d48' }}>Aplikasi Mengalami Kendala</h2>
          <p style={{ color: '#475569', marginBottom: '20px' }}>
            {this.state.error?.toString() || 'Terjadi kesalahan sistem.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
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
// 2. KOMPONEN HALAMAN (Pages)
// ==========================================

function Dashboard() {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#0f172a', marginTop: 0 }}>Dashboard KSP Modern 🚀</h2>
      <p style={{ color: '#334155' }}>
        Selamat datang di sistem manajemen Koperasi Simpan Pinjam.
      </p>
      
      {/* Ringkasan Kartu Sederhana */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', minWidth: '200px', flex: '1' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Total Anggota</span>
          <h3 style={{ margin: '8px 0 0 0', color: '#0f172a' }}>120 Orang</h3>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', minWidth: '200px', flex: '1' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Total Pinjaman Aktif</span>
          <h3 style={{ margin: '8px 0 0 0', color: '#16a34a' }}>Rp 45.000.000</h3>
        </div>
      </div>
    </div>
  )
}

function Anggota() {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#0f172a', marginTop: 0 }}>Data Anggota</h2>
      <p style={{ color: '#334155' }}>Kelola daftar anggota Koperasi Simpan Pinjam.</p>
    </div>
  )
}

function Pinjaman() {
  return (
    <div style={{ padding: '24px' }}>
      <h2 style={{ color: '#0f172a', marginTop: 0 }}>Data Pinjaman</h2>
      <p style={{ color: '#334155' }}>Daftar pengajuan dan riwayat transaksi pinjaman.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h2>404 - Halaman Tidak Ditemukan</h2>
      <p>Halaman yang Anda cari tidak tersedia.</p>
      <Link to="/" style={{ color: '#2563eb', fontWeight: 'bold' }}>Kembali ke Dashboard</Link>
    </div>
  )
}

// ==========================================
// 3. UTAMA: App Component
// ==========================================
export default function App() {
  return (
    <ErrorBoundary>
      <Router basename="/ksp-modern">
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a' }}>
          
          {/* Header Navigasi */}
          <nav style={{
            backgroundColor: '#1e293b',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <strong style={{ color: '#ffffff', fontSize: '18px', marginRight: '10px' }}>KSP Modern</strong>
            <Link to="/" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '14px' }}>Dashboard</Link>
            <Link to="/anggota" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '14px' }}>Anggota</Link>
            <Link to="/pinjaman" style={{ color: '#f8fafc', textDecoration: 'none', fontSize: '14px' }}>Pinjaman</Link>
          </nav>

          {/* Area Utama Konten */}
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/anggota" element={<Anggota />} />
              <Route path="/pinjaman" element={<Pinjaman />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

        </div>
      </Router>
    </ErrorBoundary>
  )
}
