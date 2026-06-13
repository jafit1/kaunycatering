"use client"

import { useState } from "react"
import { addProduct, deleteProduct, updateSetting, addCategory, deleteCategory } from "./actions"

type Category = { id: string, name: string }
type Variant = { id: string, name: string, price: number }
type Product = { id: string, name: string, price: number, imageUrl: string | null, categories?: Category[], hasVariants?: boolean, variantType?: string | null, variants?: Variant[] }
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

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({ message: '', visible: false, type: 'success' })
  const [toastTimeoutId, setToastTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutId) clearTimeout(toastTimeoutId)
    setToast({ message, visible: true, type })
    const id = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
    setToastTimeoutId(id)
  }

  const [newMenuName, setNewMenuName] = useState('')
  const [newMenuPrice, setNewMenuPrice] = useState('')
  const [newMenuImageUrl, setNewMenuImageUrl] = useState('')
  const [searchImagesResult, setSearchImagesResult] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [hasVariants, setHasVariants] = useState(false)
  const [variantType, setVariantType] = useState<'SAME_PRICE' | 'DIFFERENT_PRICE'>('SAME_PRICE')
  const [variants, setVariants] = useState<{name: string, price: string}[]>([])

  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'category', id: string, name: string } | null>(null)

  const handleEditClick = (p: Product) => {
    setEditingProductId(p.id)
    setNewMenuName(p.name)
    setNewMenuPrice(String(p.price))
    setNewMenuImageUrl(p.imageUrl || '')
    setSelectedCategories(p.categories?.map(c => c.id) || [])
    setHasVariants(p.hasVariants || false)
    setVariantType((p.variantType as any) || 'SAME_PRICE')
    setVariants(p.variants?.map(v => ({ name: v.name, price: String(v.price) })) || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingProductId(null)
    setNewMenuName('')
    setNewMenuPrice('')
    setNewMenuImageUrl('')
    setSelectedCategories([])
    setHasVariants(false)
    setVariantType('SAME_PRICE')
    setVariants([])
  }

  const handleSearchImages = async () => {
    if (!newMenuName) {
      alert('Isi nama menu terlebih dahulu untuk mencari gambar.')
      return
    }
    setIsSearching(true)
    setSearchImagesResult([])
    try {
      const res = await fetch('/api/search-image?q=' + encodeURIComponent(newMenuName))
      const data = await res.json()
      if (!res.ok) {
        alert(data.error + '\\n\\n' + (data.details || ''))
      } else if (data.images) {
        setSearchImagesResult(data.images)
      }
    } catch (e) {
      alert('Gagal mencari gambar.')
    }
    setIsSearching(false)
  }

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    // Add selected categories
    formData.delete('categories') // clear default checkbox behavior
    selectedCategories.forEach(id => formData.append('categories', id))
    
    if (selectedCategories.length === 0) {
      showToast('Pilih minimal satu kategori!', 'error')
      return
    }

    formData.set('hasVariants', String(hasVariants))
    if (hasVariants) {
      formData.set('variantType', variantType)
      formData.set('variants', JSON.stringify(variants))
    }

    if (editingProductId) {
      formData.set('id', editingProductId)
      // Import updateProduct at top of file, or assume it's imported via actions
      const { updateProduct } = await import('./actions')
      await updateProduct(formData)
      showToast('Menu berhasil diperbarui!', 'success')
    } else {
      await addProduct(formData)
      showToast('Menu berhasil ditambahkan!', 'success')
    }
    resetForm()
  }

  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await addCategory(formData)
    e.currentTarget.reset()
    showToast('Kategori berhasil ditambahkan!', 'success')
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
    <h3 className="text-base font-bold text-ink mb-4 pb-2 border-b border-hairline">{children}</h3>
  )

  return (
    <div className="min-h-screen bg-surface-1 flex flex-col md:flex-row">
      {/* Custom Toast Notification */}
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`flex items-center gap-3 px-4 py-3 md:px-5 md:py-3.5 rounded-aws-pill shadow-lg border ${toast.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
          {toast.type === 'success' ? (
            <div className="w-6 h-6 flex-shrink-0 bg-green-500 rounded-aws-pill flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
          ) : (
            <div className="w-6 h-6 flex-shrink-0 bg-red-500 rounded-aws-pill flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>
          )}
          <span className="font-semibold text-sm md:text-base whitespace-nowrap">{toast.message}</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-hairline flex-shrink-0 flex flex-col sticky top-0 md:h-screen z-20 shadow-aws-elevation-1 md:shadow-none">
        <div className="p-4 md:p-6 border-b border-hairline bg-white">
          <h2 className="text-lg font-extrabold text-ink">Panel Admin</h2>
          <div className="text-xs text-ink-faded font-medium">{storeName}</div>
        </div>
        <div className="flex flex-row md:flex-col gap-1 p-2 md:p-4 overflow-x-auto no-scrollbar flex-1 bg-surface-1 md:bg-white">
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-aws-card font-semibold text-sm whitespace-nowrap transition-colors flex-1 md:flex-none ${activeTab === 'katalog' ? 'bg-orange-50 text-primary' : 'text-ink-body hover:bg-surface-1'}`}
            onClick={() => setActiveTab('katalog')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Manajemen Menu
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-aws-card font-semibold text-sm whitespace-nowrap transition-colors flex-1 md:flex-none ${activeTab === 'kategori' ? 'bg-orange-50 text-primary' : 'text-ink-body hover:bg-surface-1'}`}
            onClick={() => setActiveTab('kategori')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            Kategori Menu
          </button>
          <button
            className={`flex items-center gap-3 px-4 py-3 rounded-aws-card font-semibold text-sm whitespace-nowrap transition-colors flex-1 md:flex-none ${activeTab === 'pengaturan' ? 'bg-orange-50 text-primary' : 'text-ink-body hover:bg-surface-1'}`}
            onClick={() => setActiveTab('pengaturan')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Pengaturan Website
          </button>
          
          <a href="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-aws-card font-semibold text-sm whitespace-nowrap text-ink-body hover:bg-surface-1 transition-colors mt-auto flex-1 md:flex-none">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            Lihat Website ↗
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full md:max-w-5xl">

        {/* ─── TAB: KATALOG ─── */}
        {activeTab === 'katalog' && (
          <div>
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6 mb-6">
              <SectionTitle>✚ Tambah Menu Baru</SectionTitle>
              <form onSubmit={handleAddProduct}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-ink mb-1.5">Nama Menu</label>
                  <input name="name" value={newMenuName} onChange={e => setNewMenuName(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" required placeholder="Contoh: Nasi Goreng Spesial" />
                </div>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-ink mb-1.5">Kategori (Bisa pilih lebih dari satu)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border border-hairline rounded-aws-card bg-white max-h-48 overflow-y-auto">
                      {categories.map(c => (
                        <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm text-ink">
                          <input 
                            type="checkbox" 
                            name="categories" 
                            value={c.id} 
                            checked={selectedCategories.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCategories([...selectedCategories, c.id])
                              else setSelectedCategories(selectedCategories.filter(id => id !== c.id))
                            }}
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" 
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-1/3">
                    <label className="block text-sm font-semibold text-ink mb-1.5">Harga Dasar (Rp)</label>
                    <input name="price" type="number" value={newMenuPrice} onChange={e => setNewMenuPrice(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" required={!hasVariants || variantType === 'SAME_PRICE'} placeholder="Contoh: 15000" />
                    {hasVariants && variantType === 'DIFFERENT_PRICE' && <small className="text-ink-faded text-xs mt-1 block">Biarkan 0 jika harga murni bergantung pada varian.</small>}
                  </div>
                </div>

                {/* Variants Section */}
                <div className="mb-4 p-4 border border-hairline rounded-aws-card bg-surface-1">
                  <label className="flex items-center gap-2 font-semibold text-ink cursor-pointer mb-2">
                    <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer" />
                    Produk ini memiliki pilihan varian (misal: ukuran, rasa, topping)?
                  </label>
                  
                  {hasVariants && (
                    <div className="mt-3">
                      <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-ink">
                          <input type="radio" name="variantType" checked={variantType === 'SAME_PRICE'} onChange={() => setVariantType('SAME_PRICE')} className="text-primary focus:ring-primary" />
                          Semua Varian Harga Sama
                        </label>
                        <label className="cursor-pointer flex items-center gap-2 text-sm font-medium text-ink">
                          <input type="radio" name="variantType" checked={variantType === 'DIFFERENT_PRICE'} onChange={() => setVariantType('DIFFERENT_PRICE')} className="text-primary focus:ring-primary" />
                          Harga Berbeda Tiap Varian
                        </label>
                      </div>

                      <div className="flex flex-col gap-2">
                        {variants.map((v, i) => (
                          <div key={i} className="flex gap-2">
                            <input className="flex-1 border border-hairline rounded-aws-sharp px-4 py-2 text-sm text-ink font-medium focus:ring-2 focus:ring-primary outline-none" placeholder="Nama varian (Misal: Besar)" value={v.name} onChange={e => {
                              const next = [...variants]; next[i].name = e.target.value; setVariants(next)
                            }} required />
                            {variantType === 'DIFFERENT_PRICE' && (
                              <input type="number" className="w-1/3 border border-hairline rounded-aws-sharp px-4 py-2 text-sm text-ink font-medium focus:ring-2 focus:ring-primary outline-none" placeholder="Harga (Rp)" value={v.price} onChange={e => {
                                const next = [...variants]; next[i].price = e.target.value; setVariants(next)
                              }} required />
                            )}
                            <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="px-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-aws-card font-bold transition-colors">&times;</button>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => setVariants([...variants, {name: '', price: ''}])} className="mt-3 px-4 py-2 bg-white border border-hairline hover:bg-surface-1 text-ink rounded-aws-card text-sm font-bold transition-colors">+ Tambah Varian</button>
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-ink mb-1.5">URL Gambar (Opsional)</label>
                  <div className="flex gap-2">
                    <input name="imageUrl" value={newMenuImageUrl} onChange={e => setNewMenuImageUrl(e.target.value)} className="flex-1 border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="https://..." />
                    <button type="button" onClick={handleSearchImages} disabled={isSearching} className="px-4 bg-nav-bg hover:bg-slate-900 text-white rounded-aws-card font-bold transition-colors whitespace-nowrap">
                      {isSearching ? '⏳ Mencari...' : '🔍 Cari Gambar'}
                    </button>
                  </div>
                  {searchImagesResult.length > 0 && (
                    <div className="mt-3 p-3 bg-surface-1 rounded-aws-card border border-hairline">
                      <div className="text-xs font-bold text-ink mb-2">Pilih Gambar:</div>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar snap-x">
                        {searchImagesResult.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            onClick={() => setNewMenuImageUrl(img)}
                            className={`w-20 h-20 object-cover rounded-aws-card cursor-pointer snap-start flex-shrink-0 transition-all ${newMenuImageUrl === img ? 'ring-2 ring-primary opacity-100' : 'opacity-60 hover:opacity-100 border border-hairline'}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <small className="block mt-1 text-xs text-ink-faded">Tempel link gambar atau gunakan fitur pencarian otomatis.</small>
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 bg-primary hover:bg-primary text-white py-3 rounded-aws-card font-bold transition-colors shadow-aws-elevation-1">{editingProductId ? '💾 Simpan Perubahan' : '✚ Simpan Menu'}</button>
                  {editingProductId && <button type="button" onClick={resetForm} className="flex-1 bg-white hover:bg-surface-1 text-ink-body border border-hairline py-3 rounded-aws-card font-bold transition-colors">Batal Edit</button>}
                </div>
              </form>
            </div>

            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6 mb-8">
              <SectionTitle>Daftar Menu ({products.length} item)</SectionTitle>
              {products.length === 0 ? (
                <div className="text-center p-8 text-ink-faded bg-surface-1 rounded-aws-card border border-hairline">
                  Belum ada menu. Tambahkan menu pertama di atas.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {products.map(p => (
                    <div key={p.id} className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline overflow-hidden flex flex-col hover:shadow-aws-elevation-1 transition-shadow">
                      <div className="w-full aspect-square md:aspect-[4/3] bg-surface-1 relative overflow-hidden">
                        <img src={p.imageUrl || 'https://via.placeholder.com/300?text=No+Image'} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-3 md:p-4 flex flex-col flex-1">
                        <div className="font-bold text-ink text-sm md:text-base line-clamp-2 mb-1">{p.name}</div>
                        <div className="font-bold text-primary text-sm md:text-base mb-1">Rp {p.price.toLocaleString('id-ID')}</div>
                        <div className="text-xs text-ink-faded mb-3 md:mb-4 line-clamp-1">
                          {p.categories?.map(c => c.name).join(', ') || 'Tanpa Kategori'}
                        </div>
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="flex-1 bg-white hover:bg-surface-1 text-ink-body border border-hairline py-1.5 md:py-2 rounded-[8px] font-semibold text-xs md:text-sm transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setItemToDelete({ type: 'product', id: p.id, name: p.name })}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-1.5 md:py-2 rounded-[8px] font-semibold text-xs md:text-sm transition-colors"
                          >
                            Hapus
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
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6 mb-6">
              <SectionTitle>✚ Tambah Kategori Baru</SectionTitle>
              <form onSubmit={handleAddCategory}>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-ink mb-1.5">Nama Kategori</label>
                  <input name="name" className="w-full border border-hairline rounded-aws-sharp px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" required placeholder="Contoh: Minuman Dingin" />
                </div>
                <button type="submit" className="bg-primary hover:bg-primary text-white py-3 px-6 rounded-aws-card font-bold transition-colors shadow-aws-elevation-1">✚ Simpan Kategori</button>
              </form>
            </div>

            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6 mb-8">
              <SectionTitle>Daftar Kategori ({categories.length})</SectionTitle>
              <div className="flex flex-col gap-3">
                {categories.length === 0 && (
                  <div className="text-center p-8 text-ink-faded bg-surface-1 rounded-aws-card border border-hairline">
                    Belum ada kategori.
                  </div>
                )}
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center p-4 border border-hairline rounded-aws-card bg-surface-1 hover:border-hairline transition-colors">
                    <div className="font-bold text-ink flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[8px] bg-white border border-hairline flex items-center justify-center text-primary">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                      </div>
                      {c.name}
                    </div>
                    <button
                      onClick={() => setItemToDelete({ type: 'category', id: c.id, name: c.name })}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-[8px] font-bold text-sm transition-colors"
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
          <div className="flex flex-col gap-6">
            {/* Identitas Toko */}
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6">
              <SectionTitle>🏪 Identitas Toko</SectionTitle>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Nama Toko / Bisnis</label>
                <input value={storeName} onChange={e => setStoreName(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="Kauny Catering" />
                <small className="text-ink-faded text-xs mt-1 block">Ditampilkan di header, footer, dan seluruh halaman.</small>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Tagline / Slogan</label>
                <input value={storeTagline} onChange={e => setStoreTagline(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="Sajian lezat untuk setiap momen spesial Anda." />
                <small className="text-ink-faded text-xs mt-1 block">Kalimat singkat yang muncul di footer.</small>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">URL Logo (Opsional)</label>
                <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="https://..." />
                <small className="text-ink-faded text-xs mt-1 block">Jika diisi, logo gambar akan menggantikan teks nama toko di header.</small>
              </div>
            </div>

            {/* Tentang Kami */}
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6">
              <SectionTitle>📖 Deskripsi "Tentang Kami"</SectionTitle>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Deskripsi Toko</label>
                <textarea
                  value={storeAbout}
                  onChange={e => setStoreAbout(e.target.value)}
                  className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow resize-y"
                  rows={4}
                  placeholder="Ceritakan tentang bisnis Anda..."
                />
                <small className="text-ink-faded text-xs mt-1 block">Muncul di bagian "Tentang Kami" pada halaman utama.</small>
              </div>
            </div>

            {/* Lokasi & Jam */}
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6">
              <SectionTitle>📍 Lokasi & Jam Operasional</SectionTitle>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Alamat Toko</label>
                <input value={storeAddress} onChange={e => setStoreAddress(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="Jl. Contoh No. 1, Kota, Provinsi" />
                <small className="text-ink-faded text-xs mt-1 block">Ditampilkan di bagian informasi toko.</small>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Jam Operasional</label>
                <textarea
                  value={storeHours}
                  onChange={e => setStoreHours(e.target.value)}
                  className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow resize-y"
                  rows={3}
                  placeholder={"Senin – Sabtu: 07.00 – 20.00\nMinggu: 08.00 – 17.00"}
                />
                <small className="text-ink-faded text-xs mt-1 block">Gunakan Enter/baris baru untuk memisahkan hari.</small>
              </div>
            </div>

            {/* Kontak & Sosmed */}
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6">
              <SectionTitle>📱 Kontak & Media Sosial</SectionTitle>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Nomor WhatsApp Penerima Pesanan</label>
                <input value={waNumber} onChange={e => setWaNumber(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="628xxxxxxxxxx" />
                <small className="text-ink-faded text-xs mt-1 block">Semua pesanan pelanggan dikirim ke nomor ini. Mulai dengan 628 (tanpa + atau 0).</small>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Username Instagram</label>
                <input value={storeInstagram} onChange={e => setStoreInstagram(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" placeholder="@namatoko" />
                <small className="text-ink-faded text-xs mt-1 block">Ditampilkan di bagian media sosial.</small>
              </div>
            </div>

            {/* Keamanan */}
            <div className="bg-white rounded-aws-card shadow-aws-elevation-1 border border-hairline p-4 md:p-6">
              <SectionTitle>🔒 Keamanan Admin</SectionTitle>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-ink mb-1.5">Password Admin</label>
                <input value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full border border-hairline rounded-aws-card px-4 py-3 text-ink font-medium focus:ring-2 focus:ring-primary outline-none transition-shadow" type="password" placeholder="Masukkan password baru..." />
                <small className="text-ink-faded text-xs mt-1 block">Kosongkan jika tidak ingin mengubah password.</small>
              </div>
            </div>

            {/* Tombol Simpan (sticky) */}
            <div className="sticky bottom-4 z-10">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className={`w-full py-4 rounded-aws-card font-extrabold text-white text-lg shadow-lg transition-colors ${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary'}`}
              >
                {saving ? '⏳ Menyimpan...' : saved ? '✅ Tersimpan!' : '💾 Simpan Semua Pengaturan'}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setItemToDelete(null)}>
          <div className="bg-white rounded-aws-card shadow-aws-elevation-1 w-full max-w-sm p-6 text-center animate-[modalFadeIn_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-extrabold text-ink mb-2">
              Hapus {itemToDelete.type === 'product' ? 'Menu' : 'Kategori'}?
            </h3>
            <p className="text-ink-body text-sm mb-6">
              Apakah Anda yakin ingin menghapus <strong>"{itemToDelete.name}"</strong>? <br />
              Tindakan ini permanen dan tidak bisa dikembalikan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-white hover:bg-surface-1 text-ink-body border border-hairline py-3 rounded-aws-card font-bold transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={async () => {
                  if (itemToDelete.type === 'product') {
                    await deleteProduct(itemToDelete.id)
                    showToast('Menu berhasil dihapus', 'success')
                  }
                  if (itemToDelete.type === 'category') {
                    await deleteCategory(itemToDelete.id)
                    showToast('Kategori berhasil dihapus', 'success')
                  }
                  setItemToDelete(null)
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-aws-card font-bold transition-colors shadow-aws-elevation-1"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
