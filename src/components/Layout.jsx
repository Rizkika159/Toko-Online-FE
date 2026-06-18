import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const menuItems = [
  { to: '/', icon: '📊', label: 'Dashboard', end: true },
  { to: '/produk', icon: '📦', label: 'Produk', end: false },
  { to: '/pelanggan', icon: '👥', label: 'Pelanggan', end: false },
  { to: '/pesanan', icon: '🛒', label: 'Pesanan', end: false },
]

const pageTitles = {
  '/': 'Dashboard',
  '/produk': 'Kelola Produk',
  '/pelanggan': 'Kelola Pelanggan',
  '/pesanan': 'Kelola Pesanan',
}

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const currentPage = pageTitles[location.pathname] || 'Admin Panel'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">🛍️</div>
          <span>Toko Online</span>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="btn btn-ghost"
            style={{ width: '100%', color: '#94a3b8', justifyContent: 'center' }}
            onClick={() => setShowLogoutConfirm(true)}
          >
            🚪 <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar">
          <h2>{currentPage}</h2>
          <div className="topbar-right">
            <span className="topbar-badge">Admin</span>
          </div>
        </div>
        <div className="page-content page-enter" key={location.pathname}>
          <Outlet />
        </div>
      </main>

      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 380, textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>👋</div>
            <h3 style={{ justifyContent: 'center', marginBottom: 8 }}>Keluar dari Panel?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 24 }}>
              Anda akan diarahkan ke halaman login.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setShowLogoutConfirm(false)}>Batal</button>
              <button className="btn btn-danger" onClick={handleLogout}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
