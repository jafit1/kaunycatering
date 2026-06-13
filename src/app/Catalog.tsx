"use client"

import { useState, useMemo, useEffect } from "react"
import { Check, X, Package, ShoppingCart, Info, ChevronRight, MessageSquare } from "lucide-react"

type Variant = { id: string, name: string, price: number }
type Product = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  categories?: { name: string }[]
  hasVariants?: boolean
  variantType?: string | null
  variants?: Variant[]
}

type SnackBox = {
  items: { [id: string]: number }
  qty: number
  pkg: string
}

// Custom Quantity Selector Component (Manual Type + Buttons)
function QuantitySelector({ 
  value, 
  onChange, 
  onRemove 
}: { 
  value: number
  onChange: (val: number) => void
  onRemove?: () => void
}) {
  // Local display state lets user fully clear the input while typing
  const [displayValue, setDisplayValue] = useState<string>(String(value))

  // Sync display value if parent changes externally (e.g. via +/- button)
  useEffect(() => {
    setDisplayValue(String(value))
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits, allow empty string while mid-edit
    const raw = e.target.value.replace(/[^0-9]/g, "")
    setDisplayValue(raw)
    if (raw !== "") {
      const num = parseInt(raw, 10)
      if (!isNaN(num) && num >= 1) {
        onChange(num)
      }
    }
  }

  const handleBlur = () => {
    const num = parseInt(displayValue, 10)
    if (!displayValue || isNaN(num) || num < 1) {
      // Input left empty → remove item or reset to 1
      if (onRemove) {
        onRemove()
      } else {
        onChange(1)
        setDisplayValue("1")
      }
    } else {
      // Normalize display (strip leading zeros etc.)
      setDisplayValue(String(num))
    }
  }

  const decrement = () => {
    if (value > 1) {
      onChange(value - 1)
    } else if (onRemove) {
      onRemove()
    }
  }

  return (
    <div className="flex items-center border border-hairline rounded-sm overflow-hidden bg-white w-full h-[42px] shadow-sm">
      <button 
        type="button" 
        className="w-10 h-full flex items-center justify-center text-ink hover:bg-surface-1 transition-colors font-bold text-lg" 
        onClick={decrement}
        aria-label="Decrease quantity"
      >
        <span>-</span>
      </button>
      <input 
        type="text" 
        inputMode="numeric" 
        pattern="[0-9]*" 
        className="flex-1 w-0 h-full text-center border-x border-hairline font-semibold text-ink text-sm outline-none bg-transparent" 
        value={displayValue} 
        onChange={handleInputChange}
        onBlur={handleBlur}
      />
      <button 
        type="button" 
        className="w-10 h-full flex items-center justify-center text-ink hover:bg-surface-1 transition-colors font-bold text-lg" 
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <span>+</span>
      </button>
    </div>
  )
}


export default function Catalog({ initialProducts, waNumber }: { initialProducts: Product[], waNumber: string }) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua")
  const [cartAnimating, setCartAnimating] = useState(false)
  
  // Shopping Cart States
  const [normalCart, setNormalCart] = useState<{ [id: string]: number }>({})
  const [snackBoxes, setSnackBoxes] = useState<SnackBox[]>([])
  
  // Snack Box Builder States
  const [isBuildingBox, setIsBuildingBox] = useState(false)
  const [draftBox, setDraftBox] = useState<{ [id: string]: number }>({})
  const [showBoxDetailsModal, setShowBoxDetailsModal] = useState(false)
  const [boxQty, setBoxQty] = useState(1)
  const [boxPkg, setBoxPkg] = useState("Box")
  
  // Product Modal (Image 2 equivalent)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [modalMode, setModalMode] = useState<'cart' | 'snack_box'>('snack_box')

  // Grand Checkout
  const [showCheckout, setShowCheckout] = useState(false)
  const [customerInfo, setCustomerInfo] = useState({ name: '', address: '', date: '' })

  // Custom Toast State
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: 'success' | 'error' }>({
    message: '',
    visible: false,
    type: 'success',
  })
  const [toastTimeoutId, setToastTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutId) {
      clearTimeout(toastTimeoutId)
    }
    setToast({ message, visible: true, type })
    const id = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
    setToastTimeoutId(id)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutId) clearTimeout(toastTimeoutId)
    }
  }, [toastTimeoutId])

  const categories = useMemo(() => {
    const cats = new Set(initialProducts.flatMap(p => p.categories?.map(c => c.name) || []))
    return ["Semua", ...Array.from(cats)] as string[]
  }, [initialProducts])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }

  const getCartItemInfo = (cartKey: string) => {
    const [pId, vId] = cartKey.split('__')
    const p = initialProducts.find(x => x.id === pId)
    if (!p) return null
    if (vId && p.variants) {
      const v = p.variants.find(x => x.id === vId)
      if (v) {
        return { product: p, variant: v, name: `${p.name} - ${v.name}`, price: p.variantType === 'DIFFERENT_PRICE' ? v.price : p.price }
      }
    }
    return { product: p, variant: null, name: p.name, price: p.price }
  }

  // --- Normal Cart Logic ---
  const addToNormalCart = (product: Product, variantId?: string) => {
    const key = variantId ? `${product.id}__${variantId}` : product.id
    setNormalCart(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
    
    const variantName = variantId ? ` - ${product.variants?.find(v => v.id === variantId)?.name}` : ''
    showToast(`${product.name}${variantName} ditambahkan ke keranjang!`, 'success')
    
    setCartAnimating(true)
    setTimeout(() => setCartAnimating(false), 300)
    setSelectedProduct(null)
  }

  const updateNormalCartQty = (cartKey: string, qty: number) => {
    if (qty <= 0) {
      setNormalCart(prev => {
        const next = { ...prev }
        delete next[cartKey]
        return next
      })
      const info = getCartItemInfo(cartKey)
      if (info) showToast(`${info.name} dihapus dari keranjang`, 'success')
    } else {
      setNormalCart(prev => ({ ...prev, [cartKey]: qty }))
    }
  }

  const normalCartTotalItems = Object.values(normalCart).reduce((a, b) => a + b, 0)
  const normalCartTotalPrice = Object.entries(normalCart).reduce((sum, [key, qty]) => {
    const info = getCartItemInfo(key)
    return sum + (info?.price || 0) * qty
  }, 0)

  // --- Box Builder Logic ---
  const openProductModal = (product: Product, mode: 'cart' | 'snack_box') => {
    setSelectedProduct(product)
    setModalMode(mode)
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id)
    } else {
      setSelectedVariantId('')
    }
  }

  const addToDraftBox = (product: Product, variantId?: string) => {
    const key = variantId ? `${product.id}__${variantId}` : product.id
    setDraftBox(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }))
    showToast(`${product.name} dimasukkan ke Snack Box!`, 'success')
    setSelectedProduct(null)
  }

  const updateDraftBoxQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromDraftBox(productId)
    } else {
      setDraftBox(prev => ({ ...prev, [productId]: qty }))
    }
  }

  const removeFromDraftBox = (id: string) => {
    setDraftBox(prev => {
      const newDraft = { ...prev }
      delete newDraft[id]
      return newDraft
    })
    const p = initialProducts.find(p => p.id === id)
    if (p) showToast(`${p.name} dikeluarkan dari racikan box`, 'success')
  }

  const draftBoxTotalPrice = Object.entries(draftBox).reduce((sum, [id, qty]) => {
    const p = initialProducts.find(p => p.id === id)
    return sum + (p?.price || 0) * qty
  }, 0)

  const saveDraftBox = () => {
    if (Object.keys(draftBox).length === 0) {
      showToast("Isi snack box belum dipilih!", "error")
      return
    }
    setShowBoxDetailsModal(true)
  }

  const confirmSnackBox = () => {
    if (boxQty < 1) {
      showToast("Jumlah paket minimal 1 box!", "error")
      return
    }
    setSnackBoxes(prev => [...prev, { items: draftBox, qty: boxQty, pkg: boxPkg }])
    setDraftBox({})
    setBoxQty(1)
    setBoxPkg("Box")
    setShowBoxDetailsModal(false)
    setIsBuildingBox(false)
    setActiveCategory("Semua")
    showToast("Paket Snack Box berhasil disimpan ke keranjang!", "success")
    setCartAnimating(true)
    setTimeout(() => setCartAnimating(false), 300)
  }

  // --- Grand Totals ---
  const grandTotalItems = normalCartTotalItems + snackBoxes.reduce((sum, box) => sum + box.qty, 0)
  const grandTotalPrice = normalCartTotalPrice + snackBoxes.reduce((sum, box) => {
    const boxPrice = Object.entries(box.items).reduce((bSum, [id, qty]) => {
      const p = initialProducts.find(p => p.id === id)
      return bSum + (p?.price || 0) * qty
    }, 0)
    return sum + (boxPrice * box.qty)
  }, 0)

  // --- WhatsApp Checkout ---
  const handleCheckout = () => {
    if (!customerInfo.name || !customerInfo.address || !customerInfo.date) {
      showToast("Mohon lengkapi data pengiriman!", "error")
      return
    }

    if (grandTotalItems === 0) {
      showToast("Keranjang belanja Anda masih kosong!", "error")
      return
    }

    let text = `Halo Kauny Catering, saya ingin pesan:\n\n`
    
    if (Object.keys(normalCart).length > 0) {
      text += `*Pesanan Satuan:*\n`
      Object.entries(normalCart).forEach(([id, qty]) => {
        const p = initialProducts.find(p => p.id === id)
        if (p) text += `- ${p.name} (${qty} x ${formatPrice(p.price)}) = ${formatPrice(p.price * qty)}\n`
      })
      text += `\n`
    }

    if (snackBoxes.length > 0) {
      text += `*Pesanan Paket (Snack Box):*\n`
      snackBoxes.forEach((box, index) => {
        const boxPrice = Object.entries(box.items).reduce((sum, [id, qty]) => {
          const p = initialProducts.find(p => p.id === id)
          return sum + (p?.price || 0) * qty
        }, 0)
        
        text += `\n📦 *Paket ${index + 1}* (${box.qty} Box) - Kemasan: ${box.pkg}\n`
        Object.entries(box.items).forEach(([id, qty]) => {
          const p = initialProducts.find(p => p.id === id)
          if (p) text += `   - ${qty}x ${p.name}\n`
        })
        text += `   Subtotal Paket: ${box.qty} x ${formatPrice(boxPrice)} = ${formatPrice(boxPrice * box.qty)}\n`
      })
      text += `\n`
    }
    
    text += `*Total Harga Keseluruhan: ${formatPrice(grandTotalPrice)}*\n\n`
    text += `*Data Pengiriman:*\n`
    text += `Nama: ${customerInfo.name}\n`
    text += `Alamat: ${customerInfo.address}\n`
    text += `Tanggal: ${customerInfo.date}\n`

    const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  return (
    <>
      {/* Custom Toast Notification */}
      <div className={`toast-container ${toast.visible ? 'visible' : ''} ${toast.type}`}>
        <div className="toast-content">
          {toast.type === 'success' ? (
            <svg className="toast-icon success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          ) : (
            <svg className="toast-icon error" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          <span className="toast-text">{toast.message}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Horizontal Category Scroll (AWS Service Tags) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar items-center">
          <button 
            className={`px-4 py-2 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors ${!isBuildingBox && activeCategory === "Semua" ? 'bg-ink text-white' : 'bg-surface-1 text-ink-body hover:bg-gray-200'}`}
            onClick={() => { setIsBuildingBox(false); setActiveCategory("Semua") }}
          >
            Semua Menu
          </button>
          
          {categories.filter(c => c !== "Semua").map(cat => (
            <button 
              key={cat}
              className={`px-4 py-2 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors ${!isBuildingBox && activeCategory === cat ? 'bg-ink text-white' : 'bg-surface-1 text-ink-body hover:bg-gray-200'}`}
              onClick={() => { setIsBuildingBox(false); setActiveCategory(cat) }}
            >
              {cat}
            </button>
          ))}

          <div className="w-[1px] h-6 bg-hairline mx-2 flex-shrink-0"></div>

          <button 
            className={`px-4 py-2 rounded-full border border-hairline text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-2 ${isBuildingBox ? 'bg-primary text-white border-primary' : 'bg-white text-primary hover:bg-surface-1'}`}
            onClick={() => { setIsBuildingBox(true) }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Buat Paket Snack
          </button>
        </div>

        {/* Builder Summary Section */}
        {isBuildingBox && (
          <div className="bg-surface-1 border border-hairline rounded-aws-card p-6 mb-8 shadow-sm">
            <div className="text-xs font-semibold text-ink-faded mb-4 uppercase tracking-wider">
              <span className="text-primary">Pilih Isi Snack Box</span> &gt; Pengemasan &amp; Jumlah
            </div>
            
            <h2 className="text-2xl font-bold text-ink mb-6">Snack Box Builder</h2>
            
            {Object.keys(draftBox).length > 0 ? (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse mb-6">
                    <thead>
                      <tr className="border-b border-hairline">
                        <th className="py-3 px-4 text-xs font-semibold text-ink-faded uppercase tracking-wider">Gambar</th>
                        <th className="py-3 px-4 text-xs font-semibold text-ink-faded uppercase tracking-wider">Menu</th>
                        <th className="py-3 px-4 text-xs font-semibold text-ink-faded uppercase tracking-wider">Harga</th>
                        <th className="py-3 px-4 text-xs font-semibold text-ink-faded uppercase tracking-wider text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(draftBox).map(([id, qty]) => {
                        const info = getCartItemInfo(id)
                        if (!info || !info.product) return null
                        return (
                          <tr key={id} className="border-b border-hairline border-opacity-50">
                            <td className="py-3 px-4">
                              <img src={info.product.imageUrl || 'https://via.placeholder.com/60'} alt={info.name} className="w-12 h-12 rounded-sm object-cover" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-semibold text-ink text-sm">{info.name}</div>
                              <div className="text-xs text-ink-faded mt-1">{info.variant ? info.variant.name : 'Standar'}</div>
                              <div className="mt-2 w-32">
                                <QuantitySelector 
                                  value={qty} 
                                  onChange={(val) => updateDraftBoxQty(id, val)}
                                  onRemove={() => removeFromDraftBox(id)}
                                />
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-ink text-sm">{formatPrice(info.price * qty)}</td>
                            <td className="py-3 px-4 text-center">
                              <button className="text-ink-faded hover:text-primary transition-colors" onClick={() => removeFromDraftBox(id)} aria-label="Remove item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      <tr>
                        <td colSpan={2} className="py-4 px-4 font-bold text-right text-ink">Sub Total (1 Box):</td>
                        <td className="py-4 px-4 font-bold text-primary">{formatPrice(draftBoxTotalPrice)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="text-right">
                  <button className="px-6 py-3 bg-primary text-white rounded-aws-pill font-bold text-sm shadow-aws-elevation-1 hover:bg-primary-hover transition-colors" onClick={saveDraftBox}>
                    Selesai, Lanjut Kemas
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-aws-card border border-hairline border-dashed">
                <p className="text-ink-faded text-sm">Silakan pilih dan tambahkan produk-produk lezat di bawah ini ke dalam snack box Anda.</p>
              </div>
            )}
          </div>
        )}

        {/* AWS Thumbnail Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {initialProducts.filter(p => isBuildingBox ? true : (activeCategory === "Semua" || p.categories?.some(c => c.name === activeCategory))).map(p => {
            const inCartQty = normalCart[p.id] || 0
            return (
              <div key={p.id} className="relative bg-white border border-hairline rounded-aws-card overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-aws-elevation-1 hover:border-primary">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-1 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                <div className="relative w-full h-48 overflow-hidden bg-white z-10">
                  <img src={p.imageUrl || 'https://via.placeholder.com/300?text=Product'} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-5 flex flex-col flex-1 z-10">
                  <h3 className="font-bold text-ink text-sm md:text-base mb-1">{p.name}</h3>
                  <div className="font-semibold text-primary text-sm mb-4">{formatPrice(p.price)}</div>
                  
                  <div className="mt-auto">
                    {isBuildingBox ? (
                      <button className="w-full py-2.5 px-4 bg-white border border-hairline text-ink font-semibold rounded-sm text-xs md:text-sm shadow-sm hover:bg-surface-1 transition-colors flex items-center justify-center gap-2" onClick={() => openProductModal(p, 'snack_box')}>
                        <Package size={16} /> Tambah ke Box
                      </button>
                    ) : (
                      inCartQty > 0 ? (
                        <QuantitySelector 
                          value={inCartQty} 
                          onChange={(qty) => updateNormalCartQty(p.id, qty)}
                          onRemove={() => updateNormalCartQty(p.id, 0)}
                        />
                      ) : (
                        <button className="w-full py-2.5 px-4 bg-white border border-hairline text-ink font-semibold rounded-sm text-xs md:text-sm shadow-sm hover:bg-surface-1 transition-colors flex items-center justify-center gap-2" onClick={() => {
                          if (p.hasVariants) {
                            openProductModal(p, 'cart')
                          } else {
                            addToNormalCart(p)
                          }
                        }}>
                          <ShoppingCart size={16} /> Tambah Keranjang
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Product Details Modal (Image 2 - HTML Replacement) */}'
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
            <div className="modal-body-split">
              <div className="modal-image-wrapper">
                <img src={selectedProduct.imageUrl || 'https://via.placeholder.com/250'} alt={selectedProduct.name} className="modal-image" />
              </div>
              <div className="modal-details">
                <div className="modal-title">{selectedProduct.name}</div>
                
                {selectedProduct.hasVariants && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="modal-select-wrapper">
                    <label className="form-label" style={{ fontSize: '12px' }}>Pilih Varian / Ukuran</label>
                    <select 
                      className="form-input" 
                      style={{ width: '100%', borderRadius: '8px' }}
                      value={selectedVariantId}
                      onChange={e => setSelectedVariantId(e.target.value)}
                    >
                      {selectedProduct.variants.map(v => (
                        <option key={v.id} value={v.id}>{v.name} {selectedProduct.variantType === 'DIFFERENT_PRICE' ? `- ${formatPrice(v.price)}` : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="modal-price">
                  {selectedProduct.hasVariants && selectedProduct.variantType === 'DIFFERENT_PRICE'
                    ? formatPrice(selectedProduct.variants?.find(v => v.id === selectedVariantId)?.price || 0)
                    : formatPrice(selectedProduct.price)}
                </div>
                <div className="modal-actions">
                  <button className="btn" onClick={() => {
                    if (modalMode === 'snack_box') {
                      addToDraftBox(selectedProduct, selectedProduct.hasVariants ? selectedVariantId : undefined)
                    } else {
                      addToNormalCart(selectedProduct, selectedProduct.hasVariants ? selectedVariantId : undefined)
                    }
                  }}>
                    {modalMode === 'snack_box' ? 'Masukkan ke Snack Box' : 'Tambah ke Keranjang'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setSelectedProduct(null)}>Batal</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Done Lets Pack It - Details Modal */}
      {showBoxDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowBoxDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowBoxDetailsModal(false)}>&times;</button>
            <h3 className="modal-heading">Detail Pengemasan Paket</h3>
            <div className="form-group">
              <label className="form-label">Jumlah Paket (Box) yang dipesan</label>
              <QuantitySelector 
                value={boxQty} 
                onChange={(val) => setBoxQty(val)}
              />
              <span className="form-help">Silakan ketik manual jumlah pesanan atau gunakan tombol +/-</span>
            </div>
            <div className="form-group">
              <label className="form-label">Pilihan Kemasan</label>
              <select className="form-input" value={boxPkg} onChange={e => setBoxPkg(e.target.value)}>
                <option value="Box">Box Karton</option>
                <option value="Kertas Snack">Kertas Snack</option>
                <option value="Tas Snack">Tas Snack</option>
              </select>
            </div>
            <div className="modal-action-buttons">
              <button className="btn btn-outline" onClick={() => setShowBoxDetailsModal(false)}>Batal</button>
              <button className="btn" onClick={confirmSnackBox}>Simpan ke Keranjang</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart (Bottom) */}
      <div className={`floating-cart ${grandTotalItems > 0 ? 'visible' : ''} ${cartAnimating ? 'cart-bounce' : ''}`}>
        <div className="floating-cart-inner">
          <div className="cart-summary-text">
            <div>
              <div className="cart-label">Total Item</div>
              <div className="cart-value-items">{grandTotalItems} Item</div>
            </div>
            <div style={{ marginLeft: '24px' }}>
              <div className="cart-label">Sub Total</div>
              <div className="cart-value-price">{formatPrice(grandTotalPrice)}</div>
            </div>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-ink border border-hairline rounded-sm font-bold shadow-sm hover:bg-surface-1 transition-colors" onClick={() => setShowCheckout(true)}>
            <ShoppingCart size={18} strokeWidth={2.5} />
            Checkout Sekarang
          </button>
        </div>
      </div>

      {/* Grand Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-aws-card w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-hairline shadow-aws-elevation-1 p-6 relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-6 right-6 text-ink-faded hover:text-primary transition-colors" onClick={() => setShowCheckout(false)}><X size={24} /></button>
            <h2 className="text-xl font-bold text-ink border-b border-hairline pb-4 mb-6">Finalisasi Pesanan</h2>
            
            {/* Interactive Cart Summary inside Checkout Screen */}
            <div className="checkout-summary-container">
              <h3 className="text-sm font-semibold text-ink-faded uppercase tracking-wider mb-4">Ringkasan Pesanan Anda</h3>
              
              {Object.keys(normalCart).length === 0 && snackBoxes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '16px 0' }}>Keranjang belanja kosong.</p>
              ) : (
                <>
                  {/* Satuan Items list */}
                  {Object.keys(normalCart).length > 0 && (
                    <div className="mb-6">
                      <div className="font-bold text-ink mb-3">Produk Satuan</div>
                      {Object.entries(normalCart).map(([id, qty]) => {
                        const info = getCartItemInfo(id)
                        if (!info || !info.product) return null
                        return (
                          <div key={id} className="summary-item-row">
                            <div className="summary-item-info">
                              <span className="font-semibold text-sm text-ink block">{info.name}</span>
                              <span className="text-xs text-primary font-bold">{formatPrice(info.price)}</span>
                            </div>
                            <div className="summary-item-qty">
                              <QuantitySelector 
                                value={qty} 
                                onChange={(qty) => updateNormalCartQty(id, qty)}
                                onRemove={() => updateNormalCartQty(id, 0)}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Snack Boxes packages list */}
                  {snackBoxes.length > 0 && (
                    <div className="mb-6">
                      <div className="font-bold text-ink mb-3">Paket Snack Box</div>
                      {snackBoxes.map((box, index) => {
                        const boxPrice = Object.entries(box.items).reduce((sum, [id, qty]) => {
                          const p = initialProducts.find(p => p.id === id)
                          return sum + (p?.price || 0) * qty
                        }, 0)
                        return (
                          <div key={index} className="summary-package-card">
                            <div className="flex items-start justify-between mb-3 border-b border-hairline pb-2">
                              <div>
                                <span className="font-bold text-ink block">📦 Paket {index + 1}</span>
                                <span className="text-xs text-ink-faded">({box.pkg})</span>
                              </div>
                              <button className="text-ink-faded hover:text-red-500 transition-colors" onClick={() => setSnackBoxes(prev => prev.filter((_, i) => i !== index))} aria-label="Hapus paket"><X size={18} /></button>
                            </div>
                            <div className="package-items-list">
                              {Object.entries(box.items).map(([id, qty]) => {
                                const p = initialProducts.find(p => p.id === id)
                                return p ? (
                                  <div key={id} className="package-item-detail">
                                    - {p.name} (x{qty})
                                  </div>
                                ) : null
                              })}
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-hairline">
                              <span className="font-bold text-primary text-sm">Subtotal: {formatPrice(boxPrice * box.qty)}</span>
                              <QuantitySelector 
                                value={box.qty} 
                                onChange={(val) => setSnackBoxes(prev => prev.map((b, i) => i === index ? { ...b, qty: val } : b))}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center py-4 text-lg font-bold text-ink border-t border-hairline mt-6">
                    <span>Total Keseluruhan</span>
                    <span className="total-val">{formatPrice(grandTotalPrice)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Delivery Form */}
            <div className="delivery-form" style={{ marginTop: '24px' }}>
              <h3 className="text-sm font-semibold text-ink-faded uppercase tracking-wider mb-4">Data Pengiriman</h3>
              
              <div className="form-group">
                <label className="form-label">Nama Pemesan</label>
                <input className="form-input" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} placeholder="Masukkan nama lengkap Anda" />
              </div>
              <div className="form-group">
                <label className="form-label">Alamat Lengkap Pengiriman</label>
                <textarea className="form-input" rows={3} value={customerInfo.address} onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})} placeholder="Alamat lengkap (RT/RW, Kelurahan, Kecamatan, Kota)" />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal Pengiriman</label>
                <input type="date" className="form-input" value={customerInfo.date} onChange={e => setCustomerInfo({...customerInfo, date: e.target.value})} />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-hairline">
              <button className="btn btn-outline" onClick={() => setShowCheckout(false)}>Kembali</button>
              <button className="px-6 py-2.5 bg-[#25D366] text-white rounded-aws-pill font-semibold shadow-sm hover:bg-[#1DA851] transition-colors flex items-center" onClick={handleCheckout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="mr-2 inline-block">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                Kirim Pesanan (WhatsApp)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

