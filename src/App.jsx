import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'

// Dynamic Imports Page
import RegisterNasabah from './pages/Auth/RegisterNasabah'
import Pembayaran from './pages/Pembayaran'
import PesanWA from './pages/PesanWA'

const DashboardPlaceholder = () => <div className="p-6 font-sans"><h1 className="text-2xl font-bold">Dashboard Koperasi</h1></div>

const ProtectedLayout = ({ children }) => {
  const { user } = useAuth()
  if (!user) return <Navigate to="/register-nasabah" />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-4">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/register-nasabah" element={<RegisterNasabah />} />
          
          {/* Protected App Routes */}
          <Route path="/" element={<ProtectedLayout><DashboardPlaceholder /></ProtectedLayout>} />
          <Route path="/pembayaran" element={<ProtectedLayout><Pembayaran /></ProtectedLayout>} />
          <Route path="/wa-marketing" element={<ProtectedLayout><PesanWA /></ProtectedLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
