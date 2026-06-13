"use client"

import { useState } from "react"
import { addProduct, deleteProduct, updateSetting, addCategory, deleteCategory } from "./actions"

type Category = { id: string, name: string }
type Product = { id: string, name: string, price: number, imageUrl: string | null, categoryId: string, category?: Category }
type Setting = { id: string, key: string, value: string }

export default function AdminDashboard({ products, categories, settings }: { products: Product[], categories: Category[], settings: Setting[] }) {
  const [activeTab, setActiveTab] = useState<'katalog' | 'kategori' | 'pengaturan'>('katalog')

  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || ''

  const [storeName, setStoreName] = useState(getSetting('store_name') || 'Kauny Catering')
  const [logoUrl, setLogoUrl] = useState(getSetting('logo_url'))
  const [storeTagline, setStoreTagline] = useState(getSetting('store_tagline') || 'Sajian lezat untuk setiap momen spesial Anda.')
  const [storeAddress, setStoreAddress] = useState(getSetting('store_address') || 'Kota Anda, Indonesia')
  const [storeHours, setStoreHours] = useState(getSetting('store_hours') || 'Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00')
  const [storeAbout, setStoreAbout] = useState(getSetting('store_about') || 'Kauny Catering lahir dari kecintaan kami terhadap kuliner Indonesia yang kaya rasa.')
  const [storeInstagram, setStoreInstagram] = useState(getSetting('store_instagram') || '@kaunycatering')
  const [waNumber, setWaNumber] = useState(getSetting('wa_number'))
  const [adminPassword, setAdminPassword] = useState(getSetting('admin_password'))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addProduct(formData)
    e.currentTarget.reset()
    alert('Menu berhasil ditambahkan!')
  }

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addCategory(formData)
    e.currentTarget.reset()
    alert('Kategori berhasil ditambahkan!')
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    await updateSetting('store_name', storeName)
    await updateSetting('logo_url', logoUrl)
    await updateSetting('store_tagline', storeTagline)
    await updateSetting('store_address', storeAddress)
    await updateSetting('store_hours', storeHours)
    await updateSetting('store_about', storeAbout)
    await updateSetting('store_instagram', storeInstagram)
    await updateSetting('wa_number', waNumber)
    await updateSetting('admin_password', adminPassword)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>{children}</h3>
  )

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Panel Admin</h2>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Kauny Catering</div>
        </div>
        <div className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === 'katalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('katalog')}
            style={{ textAlign: 'left', background: 'none', borderTop: 'none', borderRight: 'none', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Manajemen Menu
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'kategori' ? 'active' : ''}`}
            onClick={() => setActiveTab('kategori')}
            style={{ textAlign: 'left', background: 'none', borderTop: 'none', borderRight: 'none', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Kategori Menu
          </button>
          <button
            className={`admin-nav-item ${activeTab === 'pengaturan' ? 'active' : ''}`}
            onClick={() => setActiveTab('pengaturan')}
            style={{ textAlign: 'left', background: 'none', borderTop: 'none', borderRight: 'none', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Pengaturan Website
          </button>
          <a href="/" target="_blank" className="admin-nav-item" style={{ marginTop: 'auto', borderLeft: 'none' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Lihat Website ↗
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-content">

        {/* ─── TAB: KATALOG ─── */}
        {activeTab === 'katalog' && (
          <div>
            <div className="admin-card">
              <SectionTitle>✚ Tambah Menu Baru</SectionTitle>
              <form onSubmit={handleAddProduct}>
                <div className="form-group">
                  <label className="form-label">Nama Menu</label>
                  <input name="name" className="form-input" required placeholder="Contoh: Nasi Goreng Spesial" />
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                    <label className="form-label">Kategori</label>
                    <select name="categoryId" className="form-input" required>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1, minWidth: '140px' }}>
                    <label className="form-label">Harga (Rp)</label>
                    <input name="price" type="number" className="form-input" required placeholder="Contoh: 15000" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">URL Gambar (Opsional)</label>
                  <input name="imageUrl" className="form-input" placeholder="https://..." />
                  <small style={{ color: 'var(--text-secondary)' }}>Tempel link gambar dari Google Drive, Imgur, atau hosting gambar lainnya.</small>
                </div>
                <button type="submit" className="btn">✚ Simpan Menu</button>
              </form>
            </div>

            <div className="admin-card">
              <SectionTitle>Daftar Menu ({products.length} item)</SectionTitle>
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                  Belum ada menu. Tambahkan menu pertama di atas.
                </div>
              ) : (
                <div className="product-grid">
                  {products.map(p => (
                    <div key={p.id} className="product-card">
                      <div className="product-image-container">
                        <img src={p.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} alt={p.name} className="product-image" />
                      </div>
                      <div className="product-info">
                        <div className="product-name">{p.name}</div>
                        <div className="product-price">Rp {p.price.toLocaleString('id-ID')}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>{p.category?.name}</div>
                        <div className="product-card-action">
                          <button
                            onClick={async () => {
                              if (confirm('Hapus menu ini? Tindakan ini tidak bisa dibatalkan.')) {
                                await deleteProduct(p.id)
                              }
                            }}
                            className="btn btn-outline"
                            style={{ color: 'red', borderColor: 'red', width: '100%' }}
                          >
                            Hapus Menu
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: KATEGORI ─── */}
        {activeTab === 'kategori' && (
          <div>
            <div className="admin-card">
              <SectionTitle>✚ Tambah Kategori Baru</SectionTitle>
              <form onSubmit={handleAddCategory}>
                <div className="form-group">
                  <label className="form-label">Nama Kategori</label>
                  <input name="name" className="form-input" required placeholder="Contoh: Minuman Dingin" />
                </div>
                <button type="submit" className="btn">✚ Simpan Kategori</button>
              </form>
            </div>

            <div className="admin-card">
              <SectionTitle>Daftar Kategori ({categories.length})</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categories.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                    Belum ada kategori.
                  </div>
                )}
                {categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', border: '1px solid var(--border-color)', borderRadius: '8px', background: '#fff' }}>
                    <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary-color)' }}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      {c.name}
                    </div>
                    <button
                      onClick={async () => {
                        if (confirm('Hapus kategori ini? Menu yang menggunakan kategori ini mungkin terpengaruh.')) {
                          await deleteCategory(c.id)
                        }
                      }}
                      className="btn btn-outline"
                      style={{ color: 'red', borderColor: 'red', flexShrink: 0, width: 'auto', padding: '6px 16px' }}
                    >
                      Hapus
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: PENGATURAN ─── */}
        {activeTab === 'pengaturan' && (
          <div>
            {/* Identitas Toko */}
            <div className="admin-card">
              <SectionTitle>🏪 Identitas Toko</SectionTitle>
              <div className="form-group">
                <label className="form-label">Nama Toko / Bisnis</label>
                <input value={storeName} onChange={e => setStoreName(e.target.value)} className="form-input" placeholder="Kauny Catering" />
                <small style={{ color: 'var(--text-secondary)' }}>Ditampilkan di header, footer, dan seluruh halaman.</small>
              </div>
              <div className="form-group">
                <label className="form-label">Tagline / Slogan</label>
                <input value={storeTagline} onChange={e => setStoreTagline(e.target.value)} className="form-input" placeholder="Sajian lezat untuk setiap momen spesial Anda." />
                <small style={{ color: 'var(--text-secondary)' }}>Kalimat singkat yang muncul di footer.</small>
              </div>
              <div className="form-group">
                <label className="form-label">URL Logo (Opsional)</label>
                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="form-input" placeholder="https://..." />
                <small style={{ color: 'var(--text-secondary)' }}>Jika diisi, logo gambar akan menggantikan teks nama toko di header.</small>
              </div>
            </div>

            {/* Tentang Kami */}
            <div className="admin-card">
              <SectionTitle>📖 Deskripsi "Tentang Kami"</SectionTitle>
              <div className="form-group">
                <label className="form-label">Deskripsi Toko</label>
                <textarea
                  value={storeAbout}
                  onChange={e => setStoreAbout(e.target.value)}
                  className="form-input"
                  rows={4}
                  placeholder="Ceritakan tentang bisnis Anda..."
                  style={{ resize: 'vertical' }}
                />
                <small style={{ color: 'var(--text-secondary)' }}>Muncul di bagian "Tentang Kami" pada halaman utama.</small>
              </div>
            </div>

            {/* Lokasi & Jam */}
            <div className="admin-card">
              <SectionTitle>📍 Lokasi & Jam Operasional</SectionTitle>
              <div className="form-group">
                <label className="form-label">Alamat Toko</label>
                <input value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="form-input" placeholder="Jl. Contoh No. 1, Kota, Provinsi" />
                <small style={{ color: 'var(--text-secondary)' }}>Ditampilkan di bagian informasi toko.</small>
              </div>
              <div className="form-group">
                <label className="form-label">Jam Operasional</label>
                <textarea
                  value={storeHours}
                  onChange={e => setStoreHours(e.target.value)}
                  className="form-input"
                  rows={3}
                  placeholder={"Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00"}
                  style={{ resize: 'vertical' }}
                />
                <small style={{ color: 'var(--text-secondary)' }}>Gunakan Enter/baris baru untuk memisahkan hari.</small>
              </div>
            </div>

            {/* Kontak & Sosmed */}
            <div className="admin-card">
              <SectionTitle>📱 Kontak & Media Sosial</SectionTitle>
              <div className="form-group">
                <label className="form-label">Nomor WhatsApp Penerima Pesanan</label>
                <input value={waNumber} onChange={e => setWaNumber(e.target.value)} className="form-input" placeholder="628xxxxxxxxxx" />
                <small style={{ color: 'var(--text-secondary)' }}>Semua pesanan pelanggan dikirim ke nomor ini. Mulai dengan 628 (tanpa + atau 0).</small>
              </div>
              <div className="form-group">
                <label className="form-label">Username Instagram</label>
                <input value={storeInstagram} onChange={e => setStoreInstagram(e.target.value)} className="form-input" placeholder="@namatoko" />
                <small style={{ color: 'var(--text-secondary)' }}>Ditampilkan di bagian media sosial.</small>
              </div>
            </div>

            {/* Keamanan */}
            <div className="admin-card">
              <SectionTitle>🔒 Keamanan Admin</SectionTitle>
              <div className="form-group">
                <label className="form-label">Password Admin</label>
                <input value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="form-input" type="password" placeholder="Masukkan password baru..." />
                <small style={{ color: 'var(--text-secondary)' }}>Kosongkan jika tidak ingin mengubah password.</small>
              </div>
            </div>

            {/* Tombol Simpan (sticky) */}
            <div style={{ position: 'sticky', bottom: '16px' }}>
              <button
                onClick={handleSaveSettings}
                className="btn"
                disabled={saving}
                style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700 }}
              >
                {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan Semua Pengaturan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
