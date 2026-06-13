"use client"

import { useState, useMemo, useEffect } from "react"

type Product = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  categories?: { name: string }[]
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
    <div className="qty-selector">
      <button 
        type="button" 
        className="qty-btn" 
        onClick={decrement}
        aria-label="Decrease quantity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <input 
        type="text" 
        inputMode="numeric" 
        pattern="[0-9]*" 
        className="qty-input" 
        value={displayValue} 
        onChange={handleInputChange}
        onBlur={handleBlur}
      />
      <button 
        type="button" 
        className="qty-btn" 
        onClick={() => onChange(value + 1)}
        aria-label="Increase quantity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
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

  // --- Normal Cart Logic ---
  const addToNormalCart = (product: Product) => {
    setNormalCart(prev => ({ ...prev, [product.id]: 1 }))
    showToast(`${product.name} ditambahkan ke keranjang!`, 'success')
    setCartAnimating(true)
    setTimeout(() => setCartAnimating(false), 300)
  }

  const updateNormalCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      setNormalCart(prev => {
        const next = { ...prev }
        delete next[productId]
        return next
      })
      const p = initialProducts.find(p => p.id === productId)
      if (p) showToast(`${p.name} dihapus dari keranjang`, 'success')
    } else {
      setNormalCart(prev => ({ ...prev, [productId]: qty }))
    }
  }

  const normalCartTotalItems = Object.values(normalCart).reduce((a, b) => a + b, 0)
  const normalCartTotalPrice = Object.entries(normalCart).reduce((sum, [id, qty]) => {
    const p = initialProducts.find(p => p.id === id)
    return sum + (p?.price || 0) * qty
  }, 0)

  // --- Box Builder Logic ---
  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
  }

  const addToDraftBox = (product: Product) => {
    setDraftBox(prev => ({ ...prev, [product.id]: (prev[product.id] || 0) + 1 }))
    setSelectedProduct(null)
    showToast(`${product.name} dimasukkan ke racikan box!`, 'success')
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

      <div className="catalog-layout">
        
        {/* Left Sidebar / Top scroll bar on mobile */}
        <aside className="sidebar">
          <div className="sidebar-title">Kategori Menu</div>
          <ul className="sidebar-menu">
            <li 
              className={`sidebar-item ${!isBuildingBox && activeCategory === "Semua" ? 'active' : ''}`}
              onClick={() => { setIsBuildingBox(false); setActiveCategory("Semua") }}
            >
              Semua Menu
            </li>
            
            {/* Special Feature Tab */}
            <li 
              className={`sidebar-item builder-pill ${isBuildingBox ? 'active' : ''}`}
              onClick={() => { setIsBuildingBox(true) }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Buat Paket Snack
            </li>

            <div className="sidebar-divider"></div>
            
            {categories.filter(c => c !== "Semua").map(cat => (
              <li 
                key={cat}
                className={`sidebar-item ${!isBuildingBox && activeCategory === cat ? 'active' : ''}`}
                onClick={() => { setIsBuildingBox(false); setActiveCategory(cat) }}
              >
                {cat}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right Content */}
        <div className="content-area">
          
          {isBuildingBox && (
            <div className="builder-summary-section">
              <div className="builder-breadcrumbs">
                <span className="breadcrumb-active">Pilih Isi Snack Box</span> &gt; Pengemasan &amp; Jumlah
              </div>
              
              <h2 className="builder-heading">Snack Box Builder</h2>
              
              {/* Box Summary Table */}
              {Object.keys(draftBox).length > 0 ? (
                <div className="draft-summary-container">
                  <table className="box-summary-table">
                    <thead>
                      <tr>
                        <th>Gambar</th>
                        <th>Menu Makanan</th>
                        <th>Ukuran</th>
                        <th>Harga</th>
                        <th style={{ textAlign: 'center' }}>Hapus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(draftBox).map(([id, qty]) => {
                        const p = initialProducts.find(p => p.id === id)
                        if (!p) return null
                        return (
                          <tr key={id}>
                            <td>
                              <img src={p.imageUrl || 'https://via.placeholder.com/60'} alt={p.name} className="table-image" />
                            </td>
                            <td>
                              <div className="table-item-name">{p.name}</div>
                              <div style={{ marginTop: '6px' }}>
                                <QuantitySelector 
                                  value={qty} 
                                  onChange={(val) => updateDraftBoxQty(id, val)}
                                  onRemove={() => removeFromDraftBox(id)}
                                />
                              </div>
                            </td>
                            <td>Standar</td>
                            <td>{formatPrice(p.price * qty)}</td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="remove-btn" onClick={() => removeFromDraftBox(id)} aria-label="Remove item">
                                &times;
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                      <tr className="table-total-row">
                        <td colSpan={3}>Sub Total (1 Box) :</td>
                        <td style={{ color: 'var(--primary-color)' }}>{formatPrice(draftBoxTotalPrice)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                    <button className="btn btn-done-pack" style={{ width: 'auto' }} onClick={saveDraftBox}>
                      Done, Lets Pack It
                    </button>
                  </div>
                </div>
              ) : (
                <div className="builder-empty-notice">
                  <p>Silakan pilih dan tambahkan produk-produk lezat di bawah ini ke dalam snack box Anda.</p>
                </div>
              )}
            </div>
          )}

          <div className="product-grid">
            {initialProducts.filter(p => isBuildingBox ? true : (activeCategory === "Semua" || p.categories?.some(c => c.name === activeCategory))).map(p => {
              const inCartQty = normalCart[p.id] || 0
              return (
                <div key={p.id} className="product-card">
                  <div className="product-image-container">
                    <img src={p.imageUrl || 'https://via.placeholder.com/300?text=Product'} alt={p.name} className="product-image" loading="lazy" />
                  </div>
                  <div className="product-info">
                    <div className="product-name">{p.name}</div>
                    <div className="product-price">{formatPrice(p.price)}</div>
                    
                    <div className="product-card-action">
                      {isBuildingBox ? (
                        <button className="btn btn-add-box" onClick={() => openProductModal(p)}>
                          Masukkan ke Snack Box
                        </button>
                      ) : (
                        inCartQty > 0 ? (
                          <QuantitySelector 
                            value={inCartQty} 
                            onChange={(qty) => updateNormalCartQty(p.id, qty)}
                            onRemove={() => updateNormalCartQty(p.id, 0)}
                          />
                        ) : (
                          <button className="btn btn-add-cart" onClick={() => addToNormalCart(p)}>
                            Tambah ke Keranjang
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
      </div>

      {/* Product Details Modal (Image 2 - HTML Replacement) */}
      {selectedProduct && isBuildingBox && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content product-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedProduct(null)}>&times;</button>
            <div className="modal-body-split">
              <div className="modal-image-wrapper">
                <img src={selectedProduct.imageUrl || 'https://via.placeholder.com/250'} alt={selectedProduct.name} className="modal-image" />
              </div>
              <div className="modal-details">
                <div className="modal-title">{selectedProduct.name}</div>
                <div className="modal-select-wrapper">
                  <label className="form-label" style={{ fontSize: '12px' }}>Pilih Ukuran</label>
                  <select className="form-input" style={{ width: '100%', borderRadius: '8px' }}>
                    <option>Standar</option>
                  </select>
                </div>
                <div className="modal-price">{formatPrice(selectedProduct.price)}</div>
                <div className="modal-actions">
                  <button className="btn" onClick={() => addToDraftBox(selectedProduct)}>Masukkan ke Snack Box</button>
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
          <button className="btn btn-checkout-trigger" onClick={() => setShowCheckout(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            Checkout Sekarang
          </button>
        </div>
      </div>

      {/* Grand Checkout Modal */}
      {showCheckout && (
        <div className="checkout-modal" onClick={() => setShowCheckout(false)}>
          <div className="checkout-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCheckout(false)}>&times;</button>
            <h2 className="modal-heading" style={{ color: 'var(--primary-color)', borderBottom: '1px solid #eee', paddingBottom: '12px' }}>Finalisasi Pesanan</h2>
            
            {/* Interactive Cart Summary inside Checkout Screen */}
            <div className="checkout-summary-container">
              <h3 className="summary-heading">Ringkasan Pesanan Anda</h3>
              
              {Object.keys(normalCart).length === 0 && snackBoxes.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', padding: '16px 0' }}>Keranjang belanja kosong.</p>
              ) : (
                <>
                  {/* Satuan Items list */}
                  {Object.keys(normalCart).length > 0 && (
                    <div className="summary-section">
                      <div className="section-title">Produk Satuan</div>
                      {Object.entries(normalCart).map(([id, qty]) => {
                        const p = initialProducts.find(p => p.id === id)
                        if (!p) return null
                        return (
                          <div key={id} className="summary-item-row">
                            <div className="summary-item-info">
                              <span className="summary-item-name">{p.name}</span>
                              <span className="summary-item-price">{formatPrice(p.price)}</span>
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
                    <div className="summary-section">
                      <div className="section-title">Paket Snack Box</div>
                      {snackBoxes.map((box, index) => {
                        const boxPrice = Object.entries(box.items).reduce((sum, [id, qty]) => {
                          const p = initialProducts.find(p => p.id === id)
                          return sum + (p?.price || 0) * qty
                        }, 0)
                        return (
                          <div key={index} className="summary-package-card">
                            <div className="package-card-header">
                              <div>
                                <span className="package-title">📦 Paket {index + 1}</span>
                                <span className="package-packaging">({box.pkg})</span>
                              </div>
                              <button 
                                className="package-delete"
                                onClick={() => setSnackBoxes(prev => prev.filter((_, i) => i !== index))}
                                aria-label="Hapus paket"
                              >
                                &times;
                              </button>
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
                            <div className="package-card-footer">
                              <span className="package-subtotal">Subtotal: {formatPrice(boxPrice * box.qty)}</span>
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

                  <div className="grand-total-row">
                    <span>Total Keseluruhan</span>
                    <span className="total-val">{formatPrice(grandTotalPrice)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Delivery Form */}
            <div className="delivery-form" style={{ marginTop: '24px' }}>
              <h3 className="summary-heading">Data Pengiriman</h3>
              
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
            
            <div className="modal-action-buttons" style={{ marginTop: '32px' }}>
              <button className="btn btn-outline" onClick={() => setShowCheckout(false)}>Kembali</button>
              <button className="btn btn-send-wa" onClick={handleCheckout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
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

