import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../components/Toast'

export default function Produk() {
  const [produk, setProduk] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({ nama_produk: '', harga: '', stok: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const fetchProduk = async () => {
    try {
      const res = await api.get('/produk')
      setProduk(res.data.data)
    } catch (err) {
      toast.error('Gagal memuat data produk')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProduk() }, [])

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item.id_produk)
      setForm({ nama_produk: item.nama_produk, harga: item.harga, stok: item.stok })
    } else {
      setEditingId(null)
      setForm({ nama_produk: '', harga: '', stok: '' })
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
        await api.put(`/produk/${editingId}`, form)
        toast.success('Produk berhasil diupdate!')
      } else {
        await api.post('/produk', form)
        toast.success('Produk baru berhasil ditambahkan!')
      }
      setModalOpen(false)
      fetchProduk()
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan')
      toast.error('Gagal menyimpan produk')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return
    try {
      await api.delete(`/produk/${id}`)
      toast.success('Produk berhasil dihapus!')
      fetchProduk()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus produk')
    }
  }

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  if (loading) {
    return (
      <div className="card">
        <div className="loading-card">
          <div className="loading-spinner" />
          <span>Memuat data produk...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="card">
        <div className="card-header">
          <h3>📦 Data Produk</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <span style={{ fontSize: '1.1rem' }}>+</span> Tambah Produk
          </button>
        </div>

        {produk.length === 0 ? (
          <div className="empty-state">
            <span className="icon">📦</span>
            <p>Belum ada data produk</p>
            <p className="sub">Klik "Tambah Produk" untuk menambahkan produk pertama Anda</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Produk</th>
                  <th>Harga</th>
                  <th>Stok</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {produk.map((p) => (
                  <tr key={p.id_produk}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{p.id_produk}</td>
                    <td style={{ fontWeight: 600 }}>{p.nama_produk}</td>
                    <td>{formatRupiah(p.harga)}</td>
                    <td>
                      <span className={`badge ${p.stok > 10 ? 'badge-success' : p.stok > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {p.stok > 10 ? '✓' : p.stok > 0 ? '⚡' : '✕'} {p.stok} unit
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-warning btn-sm" onClick={() => openModal(p)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" style={{ marginLeft: 6 }} onClick={() => handleDelete(p.id_produk)}>🗑️ Hapus</button>
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
            <h3>{editingId ? '✏️ Edit Produk' : '📦 Tambah Produk Baru'}</h3>
            {error && <div className="alert alert-error shake"><span>⚠️</span> {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nama Produk</label>
                <input
                  type="text"
                  value={form.nama_produk}
                  onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
                  placeholder="Contoh: Laptop ASUS ROG"
                  required
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Harga (Rp)</label>
                  <input
                    type="number"
                    value={form.harga}
                    onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stok</label>
                  <input
                    type="number"
                    value={form.stok}
                    onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
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
