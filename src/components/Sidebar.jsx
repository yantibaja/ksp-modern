import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Sidebar() {
  const { profile } = useAuth()
  const location = useLocation()

  const menus = [
    { label: 'Dashboard', path: '/', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI', 'PENAGIH', 'NASABAH'] },
    { label: 'Approval Center', path: '/approval', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI'] },
    { label: 'Nasabah', path: '/nasabah', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI'] },
    { label: 'Pinjaman', path: '/pinjaman', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI', 'NASABAH'] },
    { label: 'Pembayaran', path: '/pembayaran', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI', 'PENAGIH', 'NASABAH'] },
    { label: 'Kelola Tim', path: '/tim', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI'] },
    { label: 'Pesan WA', path: '/wa-marketing', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI'] },
    { label: 'Pengaturan', path: '/pengaturan', roles: ['SUPER_ADMIN', 'ADMIN_KOPERASI'] },
  ]

  const filteredMenus = menus.filter(m => m.roles.includes(profile?.role))

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-xl">K</div>
          <div>
            <h1 className="font-bold text-sm leading-tight">{profile?.koperasi?.nama || 'Super Admin KSP'}</h1>
            <span className="text-xs text-slate-400 capitalize">{profile?.role?.replace('_', ' ')}</span>
          </div>
        </div>
        <nav className="space-y-1">
          {filteredMenus.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                location.pathname === item.path ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="text-xs text-slate-500 text-center py-2">
        KSP Digital Modern v1.0
      </div>
    </aside>
  )
}
