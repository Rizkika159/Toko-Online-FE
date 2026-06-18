import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useToast } from '../components/Toast'

export default function Pesanan() {
  const [pesanan, setPesanan] = useState([])
  const [pelanggan, setPelanggan] = useState([])
  const [produk, setProduk] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ id_pelanggan: '', items: [] })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const toast = useToast()

  const fetchData = async () => {
    try {
      const [pesananRes, pelangganRes, produkRes] = await Promise.all([
        api.get('/pesanan'),
        api.get('/pelanggan'),
        api.get('/produk'),
      ])
      setPesanan(pesananRes.data.data)
      setPelanggan(pelangganRes.data.data)
      setProduk(produkRes.data.data)
    } catch (err) {
      toast.error('Gagal memuat data pesanan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const openModal = () => {
    setForm({ id_pelanggan: '', items: [] })
    setError('')
    setModalOpen(true)
  }

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { id_produk: '', jumlah: 1, harga_satuan: 0 }] })
  }

  const updateItem = (index, field, value) => {
    const updatedItems = [...form.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    if (field === 'id_produk') {
      const selected = produk.find(p => p.id_produk === Number(value))
      if (selected) updatedItems[index].harga_satuan = selected.harga
    }
    setForm({ ...form, items: updatedItems })
  }

  const removeItem = (index) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  const totalHarga = form.items.reduce((sum, item) => sum + (item.jumlah * item.harga_satuan), 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.id_pelanggan) { setError('Pilih pelanggan terlebih dahulu'); return }
    if (form.items.length === 0) { setError('Tambahkan minimal 1 item produk'); return }
    setSaving(true)
    try {
      await api.post('/pesanan', {
        id_pelanggan: form.id_pelanggan,
        total_harga: totalHarga,
        items: form.items,
      })
      toast.success('Pesanan baru berhasil dibuat!')
      setModalOpen(false)
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan'
      setError(msg)
      toast.error('Gagal membuat pesanan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus pesanan ini?')) return
    try {
      await api.delete(`/pesanan/${id}`)
      toast.success('Pesanan berhasil dihapus!')
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pesanan')
    }
  }

  const formatRupiah = (val) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)

  const getPelangganName = (id) => {
    const p = pelanggan.find(p => p.id_pelanggan === id)
    return p ? p.nama : `ID: ${id}`
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading-card">
          <div className="loading-spinner" />
          <span>Memuat data pesanan...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="page-enter">
      <div className="card">
        <div className="card-header">
          <h3>🛒 Data Pesanan</h3>
          <button className="btn btn-primary" onClick={() => openModal()}>
            <span style={{ fontSize: '1.1rem' }}>+</span> Buat Pesanan
          </button>
        </div>

        {pesanan.length === 0 ? (
          <div className="empty-state">
            <span className="icon">🛒</span>
            <p>Belum ada data pesanan</p>
            <p className="sub">Klik "Buat Pesanan" untuk membuat pesanan baru</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID Pesanan</th>
                  <th>Pelanggan</th>
                  <th>Tanggal</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesanan.map((p, idx) => (
                  <tr key={p.id_pesanan}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{p.id_pesanan}</td>
                    <td style={{ fontWeight: 600 }}>{getPelangganName(p.id_pelanggan)}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(p.tanggal_pesanan).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatRupiah(p.total_harga)}</td>
                    <td><span className="badge badge-success">✓ Selesai</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id_pesanan)}>🗑️ Hapus</button>
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
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
            <h3>🛒 Buat Pesanan Baru</h3>
            {error && <div className="alert alert-error shake"><span>⚠️</span> {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pelanggan</label>
                <select
                  value={form.id_pelanggan}
                  onChange={(e) => setForm({ ...form, id_pelanggan: e.target.value })}
                  required
                >
                  <option value="">-- Pilih Pelanggan --</option>
                  {pelanggan.map(p => (
                    <option key={p.id_pelanggan} value={p.id_pelanggan}>{p.nama} ({p.no_hp})</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div className="section-header" style={{ marginBottom: '12px' }}>
                  <label>Item Pesanan</label>
                  <button type="button" className="btn btn-success btn-sm" onClick={addItem}>+ Tambah Item</button>
                </div>

                {form.items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 8, border: '2px dashed var(--border)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: 8 }}>🛍️</div>
                    <p style={{ fontSize: '0.85rem' }}>Klik "Tambah Item" untuk menambahkan produk</p>
                  </div>
                )}

                {form.items.map((item, idx) => (
                  <div key={idx} className="item-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="form-group">
                      {idx === 0 && <label>Produk</label>}
                      <select value={item.id_produk} onChange={(e) => updateItem(idx, 'id_produk', e.target.value)} required>
                        <option value="">-- Pilih Produk --</option>
                        {produk.map(p => (
                          <option key={p.id_produk} value={p.id_produk}>{p.nama_produk} - {formatRupiah(p.harga)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      {idx === 0 && <label>Jumlah</label>}
                      <input type="number" value={item.jumlah} min="1"
                        onChange={(e) => updateItem(idx, 'jumlah', Number(e.target.value))} required />
                    </div>
                    <div className="form-group">
                      {idx === 0 && <label>Subtotal</label>}
                      <input type="text" value={formatRupiah(item.jumlah * item.harga_satuan)} readOnly
                        style={{ background: '#f8fafc', fontWeight: 600, color: 'var(--primary)' }} />
                    </div>
                    <button type="button" className="btn btn-danger btn-icon" onClick={() => removeItem(idx)}
                      style={{ marginBottom: 1, alignSelf: 'flex-end' }} title="Hapus item">✕</button>
                  </div>
                ))}
              </div>

              {form.items.length > 0 && (
                <div className="total-row">
                  Grand Total: {formatRupiah(totalHarga)}
                </div>
              )}

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
                    <><span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Menyimpan...</>
                  ) : (
                    '💾 Simpan Pesanan'
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
