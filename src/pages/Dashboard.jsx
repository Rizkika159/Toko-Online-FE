import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

function AnimatedCounter({ target, duration = 800, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || target === 0) return
    started.current = true
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        ref.current = requestAnimationFrame(step)
      } else {
        setCount(target)
      }
    }
    ref.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])

  return <span>{prefix}{count.toLocaleString('id-ID')}{suffix}</span>
}

function AnimatedRupiah({ target, duration = 1000 }) {
  const [value, setValue] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || target === 0) return
    started.current = true
    const startTime = performance.now()
    const step = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.floor(eased * target))
      if (progress < 1) {
        ref.current = requestAnimationFrame(step)
      } else {
        setValue(target)
      }
    }
    ref.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(ref.current)
  }, [target, duration])

  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(value)

  return <span>{formatted}</span>
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total_transaksi: 0, total_pendapatan: 0 })
  const [produkCount, setProdukCount] = useState(0)
  const [pelangganCount, setPelangganCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statRes, produkRes, pelangganRes] = await Promise.all([
          api.get('/statistik'),
          api.get('/produk'),
          api.get('/pelanggan'),
        ])
        setStats(statRes.data.data)
        setProdukCount(produkRes.data.data.length)
        setPelangganCount(pelangganRes.data.data.length)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="card">
        <div className="loading-card">
          <div className="loading-spinner" />
          <span>Memuat data dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">📦</div>
          <div className="stat-info">
            <h4>Total Produk</h4>
            <div className="stat-value">
              <AnimatedCounter target={produkCount} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">👥</div>
          <div className="stat-info">
            <h4>Total Pelanggan</h4>
            <div className="stat-value">
              <AnimatedCounter target={pelangganCount} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🛒</div>
          <div className="stat-info">
            <h4>Total Transaksi</h4>
            <div className="stat-value">
              <AnimatedCounter target={stats.total_transaksi} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink">💰</div>
          <div className="stat-info">
            <h4>Total Pendapatan</h4>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              <AnimatedRupiah target={stats.total_pendapatan} />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ animationDelay: '0.3s' }}>
        <div className="card-header">
          <h3>✨ Selamat Datang!</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ fontSize: '3.5rem', animation: 'float 3s ease-in-out infinite' }}>🎯</div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: 6 }}>
              Ini adalah panel administrasi <strong>Toko Online</strong>.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Gunakan menu navigasi di sebelah kiri untuk mengelola <strong>produk</strong>, <strong>pelanggan</strong>, dan <strong>pesanan</strong> Anda.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 4 }}>
        <div className="card" style={{ animationDelay: '0.4s', cursor: 'pointer' }} onClick={() => window.location.href='/produk'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>📦</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kelola Produk</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Tambah, edit, dan hapus produk</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ animationDelay: '0.5s', cursor: 'pointer' }} onClick={() => window.location.href='/pelanggan'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👥</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kelola Pelanggan</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Atur data pelanggan toko</div>
            </div>
          </div>
        </div>
        <div className="card" style={{ animationDelay: '0.6s', cursor: 'pointer' }} onClick={() => window.location.href='/pesanan'}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛒</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Kelola Pesanan</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Buat dan pantau pesanan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
