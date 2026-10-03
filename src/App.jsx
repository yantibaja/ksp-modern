import React, { Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'

// --- 1. ERROR BOUNDARY (Mencegah Layar Putih Polos Jika Ada Crash) ---
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
        <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ color: '#d32f2f' }}>Aplikasi Mengalami Kendala</h2>
          <p style={{ color: '#555' }}>
            {this.state.error?.toString() || 'Terjadi kesalahan saat memuat komponen.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 16px',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
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

// --- 2. KOMPONEN Halaman Sementara / Placeholder ---
function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Dashboard KSP Modern 🚀</h2>
      <p>Selamat datang di sistem manajemen Koperasi Simpan Pinjam.</p>
    </div>
  )
}

function Anggota() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Data Anggota</h2>
      <p>Daftar anggota KSP akan ditampilkan di sini.</p>
    </div>
  )
}

function Pinjaman() {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Data Pinjaman</h2>
      <p>Daftar transaksi dan pengajuan pinjaman.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>404 - Halaman Tidak Ditemukan</h2>
      <Link to="/">Kembali ke Dashboard</Link>
    </div>
  )
}

// --- 3. UTAMA: App Component ---
export default function App() {
  return (
    <ErrorBoundary>
      {/* Basename wajib disesuaikan dengan nama repo GitHub Pages */}
      <Router basename="/ksp-modern">
        <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
          {/* Navigation Bar Sederhana */}
          <nav style={{
            backgroundColor: '#1e293b',
            padding: '1rem',
            display: 'flex',
            gap: '15px',
            color: '#fff'
          }}>
            <strong style={{ marginRight: '15px' }}>KSP Modern</strong>
            <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/anggota" style={{ color: '#fff', textDecoration: 'none' }}>Anggota</Link>
            <Link to="/pinjaman" style={{ color: '#fff', textDecoration: 'none' }}>Pinjaman</Link>
          </nav>

          {/* Area Content */}
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
