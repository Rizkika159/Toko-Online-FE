import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../components/Toast'

export default function Pelanggan() {
  const [pelanggan, setPelanggan] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nama: '', email: '', no_hp: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const fetchPelanggan = async () => {
    try {
      const res = await api.get('/pelanggan')
      setPelanggan(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat data pelanggan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPelanggan() }, [])

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id_pelanggan)
      setForm({ nama: item.nama, email: item.email, no_hp: item.no_hp })
    } else {
      setEditingId(null)
      setForm({ nama: '', email: '', no_hp: '' })
    }
    setError('')
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editingId) {
        await api.put(`/pelanggan/${editingId}`, form)
        toast.success('Data pelanggan berhasil diupdate!')
      } else {
        await api.post('/pelanggan', form)
        toast.success('Pelanggan baru berhasil ditambahkan!')
      }
      setModalOpen(false)
      fetchPelanggan()
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
      toast.error('Gagal menyimpan data pelanggan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pelanggan ini?')) return
    try {
      await api.delete(`/pelanggan/${id}`)
      toast.success('Pelanggan berhasil dihapus!')
      fetchPelanggan()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pelanggan')
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading-card">
          <div className="loading-spinner" />
          <span>Memuat data pelanggan...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="card">
        <div className="card-header">
          <h3>👥 Data Pelanggan</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <span style={{ fontSize: '1.1rem' }}>+</span> Tambah Pelanggan
          </button>
        </div>

        {pelanggan.length === 0 ? (
          <div className="empty-state">
            <span className="icon">👥</span>
            <p>Belum ada data pelanggan</p>
            <p className="sub">Klik "Tambah Pelanggan" untuk menambahkan pelanggan pertama</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>No. HP</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pelanggan.map((p) => (
                  <tr key={p.id_pelanggan}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{p.id_pelanggan}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: `linear-gradient(135deg, hsl(${p.id_pelanggan * 47 % 360}, 70%, 75%), hsl(${(p.id_pelanggan * 47 + 60) % 360}, 70%, 65%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                        }}>
                          {p.nama.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600 }}>{p.nama}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.email}</td>
                    <td>{p.no_hp}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-warning btn-sm" onClick={() => openModal(p)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" style={{ marginLeft: 6 }} onClick={() => handleDelete(p.id_pelanggan)}>🗑️ Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? '✏️ Edit Pelanggan' : '👤 Tambah Pelanggan Baru'}</h3>
            {error && <div className="alert alert-error shake"><span>⚠️</span> {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@contoh.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>No. Handphone</label>
                <input
                  type="text"
                  value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</>
                  ) : (
                    editingId ? '💾 Update' : '💾 Simpan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
