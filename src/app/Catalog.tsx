"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ArrowRight, Check, ChevronDown, Minus, Plus, X } from "lucide-react"
import { Drawer, Dropdown, EVT, Modal, Reveal, emit, scrollToId, useEvent } from "./ui"

type Variant = { id: string; name: string; price: number }
type Product = {
  id: string
  name: string
  price: number
  imageUrl: string | null
  description?: string | null
  categories?: { name: string }[]
  hasVariants?: boolean
  variantType?: string | null
  variants?: Variant[]
}

type SnackBox = {
  items: { [key: string]: number }
  qty: number
  pkg: string
}

type SortKey = "name-asc" | "name-desc" | "price-asc" | "price-desc"
type PriceKey = "all" | "lt10" | "10-25" | "25-50" | "gt50"

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 320'><rect width='400' height='320' fill='#eaeee9'/><g fill='none' stroke='#94c9a6' stroke-width='10' stroke-linecap='round'><path d='M150 110v100M130 110v35a20 20 0 0 0 40 0v-35M250 110c-18 0-26 30-26 55h26v45'/></g></svg>`
  )

const PACKAGING = [
  { value: "Box", label: "Box Karton", hint: "Kokoh & rapi untuk rapat / seminar" },
  { value: "Kertas Snack", label: "Kertas Snack", hint: "Praktis & ramah lingkungan" },
  { value: "Tas Snack", label: "Tas Snack", hint: "Mudah dibawa ke luar ruang" },
]

/** <img> dengan fallback placeholder bila gambar gagal dimuat */
function Img({ src, alt = "", className = "", lazy = true }: { src: string | null | undefined; alt?: string; className?: string; lazy?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src || PLACEHOLDER}
      alt={alt}
      ref={(el) => {
        // gambar yang gagal sebelum hydration tidak memicu onError → cek manual
        if (el && el.complete && el.naturalWidth === 0 && !el.src.startsWith("data:")) el.src = PLACEHOLDER
      }}
      loading={lazy ? "lazy" : undefined}
      className={className}
      onError={(e) => {
        const el = e.currentTarget
        if (el.src !== PLACEHOLDER) {
          el.src = PLACEHOLDER
          el.alt = ""
        }
      }}
    />
  )
}

const PRICE_RANGES: { value: PriceKey; label: string; test: (n: number) => boolean }[] = [
  { value: "all", label: "Semua harga", test: () => true },
  { value: "lt10", label: "Di bawah Rp10.000", test: (n) => n < 10000 },
  { value: "10-25", label: "Rp10.000 – Rp25.000", test: (n) => n >= 10000 && n <= 25000 },
  { value: "25-50", label: "Rp25.000 – Rp50.000", test: (n) => n > 25000 && n <= 50000 },
  { value: "gt50", label: "Di atas Rp50.000", test: (n) => n > 50000 },
]

const SORTS: { value: SortKey; label: string }[] = [
  { value: "name-asc", label: "Nama A–Z" },
  { value: "name-desc", label: "Nama Z–A" },
  { value: "price-asc", label: "Harga terendah" },
  { value: "price-desc", label: "Harga tertinggi" },
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price)

/** Harga tampil: untuk varian harga berbeda → harga varian termurah */
const displayPrice = (p: Product) => {
  if (p.hasVariants && p.variantType === "DIFFERENT_PRICE" && p.variants?.length) {
    return Math.min(...p.variants.map((v) => v.price))
  }
  return p.price
}

/* ─────────────────────────────────────────────────────────────
   Quantity Selector (ketik manual + tombol)
   ───────────────────────────────────────────────────────────── */
function QuantitySelector({
  value,
  onChange,
  onRemove,
  size = "md",
  tone = "light",
  full = false,
}: {
  value: number
  onChange: (val: number) => void
  onRemove?: () => void
  size?: "sm" | "md"
  tone?: "light" | "dark"
  full?: boolean
}) {
  const [displayValue, setDisplayValue] = useState<string>(String(value))
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setDisplayValue(String(value))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "")
    setDisplayValue(raw)
    if (raw !== "") {
      const num = parseInt(raw, 10)
      if (!isNaN(num) && num >= 1) onChange(num)
    }
  }

  const handleBlur = () => {
    const num = parseInt(displayValue, 10)
    if (!displayValue || isNaN(num) || num < 1) {
      if (onRemove) onRemove()
      else {
        onChange(1)
        setDisplayValue("1")
      }
    } else setDisplayValue(String(num))
  }

  const decrement = () => {
    if (value > 1) onChange(value - 1)
    else if (onRemove) onRemove()
  }

  const h = size === "sm" ? "h-8" : "h-10"
  const w = size === "sm" ? "w-8" : "w-10"
  const dark = tone === "dark"
  const btnCls = `${w} h-full grid place-items-center rounded-md transition-all duration-200 active:scale-90 ${dark ? "hover:bg-white/15" : "hover:bg-white"}`

  return (
    <div className={`flex items-center justify-between rounded-lg ${h} ${full ? "w-full" : ""} ${dark ? "bg-brand-800 text-white" : "bg-surface-1 text-ink"} select-none`}>
      <button type="button" onClick={decrement} aria-label="Kurangi" className={btnCls}>
        <Minus size={14} strokeWidth={2.4} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label="Jumlah"
        className="w-9 min-w-0 flex-1 text-center bg-transparent outline-none font-bold text-[13px]"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={(e) => e.target.select()}
      />
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Tambah" className={btnCls}>
        <Plus size={14} strokeWidth={2.4} />
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Catalog
   ───────────────────────────────────────────────────────────── */
export default function Catalog({ initialProducts, waNumber }: { initialProducts: Product[]; waNumber: string }) {
  // Filter & sort
  const [activeCategory, setActiveCategory] = useState<string>("Semua")
  const [priceRange, setPriceRange] = useState<PriceKey>("all")
  const [sortBy, setSortBy] = useState<SortKey>("name-asc")
  const [query, setQuery] = useState("")

  // Carts
  const [normalCart, setNormalCart] = useState<{ [key: string]: number }>({})
  const [snackBoxes, setSnackBoxes] = useState<SnackBox[]>([])

  // Snack box builder
  const [isBuildingBox, setIsBuildingBox] = useState(false)
  const [draftBox, setDraftBox] = useState<{ [key: string]: number }>({})
  const [boxQty, setBoxQty] = useState(1)
  const [boxPkg, setBoxPkg] = useState("Box")

  // Product modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [lastProduct, setLastProduct] = useState<Product | null>(null) // tetap tampil saat animasi keluar
  const [selectedVariantId, setSelectedVariantId] = useState<string>("")
  const [modalQty, setModalQty] = useState(1)
  const [modalMode, setModalMode] = useState<"cart" | "snack_box">("cart")

  // Cart drawer / checkout
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "form">("cart")
  const [customerInfo, setCustomerInfo] = useState({ name: "", address: "", date: "" })
  const [expandedBox, setExpandedBox] = useState<number | null>(null)

  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: "success" | "error" }>({ message: "", visible: false, type: "success" })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true, type })
    toastTimer.current = setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 2800)
  }
  useEffect(() => () => void (toastTimer.current && clearTimeout(toastTimer.current)), [])

  // Header ↔ Catalog events
  useEvent<string>(EVT.search, (q) => setQuery(q ?? ""))
  useEvent<string>(EVT.category, (cat) => {
    if (cat === "__builder__") {
      setIsBuildingBox(true)
      return
    }
    setIsBuildingBox(false)
    setActiveCategory(cat)
  })
  useEvent(EVT.openCart, () => {
    setCheckoutStep("cart")
    setCartOpen(true)
  })

  const categories = useMemo(() => {
    const cats = new Set(initialProducts.flatMap((p) => p.categories?.map((c) => c.name) || []))
    return ["Semua", ...Array.from(cats)]
  }, [initialProducts])

  const getCartItemInfo = (cartKey: string) => {
    const [pId, vId] = cartKey.split("__")
    const p = initialProducts.find((x) => x.id === pId)
    if (!p) return null
    if (vId && p.variants) {
      const v = p.variants.find((x) => x.id === vId)
      if (v) return { product: p, variant: v, name: `${p.name} - ${v.name}`, price: p.variantType === "DIFFERENT_PRICE" ? v.price : p.price }
    }
    return { product: p, variant: null as Variant | null, name: p.name, price: p.price }
  }

  const boxUnitPrice = (items: { [key: string]: number }) =>
    Object.entries(items).reduce((sum, [key, qty]) => sum + (getCartItemInfo(key)?.price || 0) * qty, 0)

  // ── Filtering ─────────────────────────────────────────────
  const visibleProducts = useMemo(() => {
    const q = query.trim().toLowerCase()
    const range = PRICE_RANGES.find((r) => r.value === priceRange)!
    const list = initialProducts.filter((p) => {
      if (!isBuildingBox && activeCategory !== "Semua" && !p.categories?.some((c) => c.name === activeCategory)) return false
      if (!range.test(displayPrice(p))) return false
      if (q) {
        const hay = [p.name, ...(p.categories?.map((c) => c.name) || []), ...(p.variants?.map((v) => v.name) || [])].join(" ").toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    const sorted = [...list]
    sorted.sort((a, b) => {
      switch (sortBy) {
        case "name-desc":
          return b.name.localeCompare(a.name, "id")
        case "price-asc":
          return displayPrice(a) - displayPrice(b)
        case "price-desc":
          return displayPrice(b) - displayPrice(a)
        default:
          return a.name.localeCompare(b.name, "id")
      }
    })
    return sorted
  }, [initialProducts, activeCategory, priceRange, sortBy, query, isBuildingBox])

  const gridKey = `${activeCategory}|${priceRange}|${sortBy}|${query}|${isBuildingBox}`
  const filtersActive = activeCategory !== "Semua" || priceRange !== "all" || !!query

  const resetFilters = () => {
    setActiveCategory("Semua")
    setPriceRange("all")
    setQuery("")
    emit(EVT.search, "")
  }

  // ── Normal cart ──────────────────────────────────────────
  const addToNormalCart = (product: Product, variantId?: string, qty = 1) => {
    const key = variantId ? `${product.id}__${variantId}` : product.id
    setNormalCart((prev) => ({ ...prev, [key]: (prev[key] || 0) + qty }))
    const variantName = variantId ? ` - ${product.variants?.find((v) => v.id === variantId)?.name}` : ""
    showToast(`${product.name}${variantName} masuk keranjang`)
    setSelectedProduct(null)
  }

  const updateNormalCartQty = (cartKey: string, qty: number) => {
    if (qty <= 0) {
      setNormalCart((prev) => {
        const next = { ...prev }
        delete next[cartKey]
        return next
      })
      const info = getCartItemInfo(cartKey)
      if (info) showToast(`${info.name} dihapus dari keranjang`)
    } else setNormalCart((prev) => ({ ...prev, [cartKey]: qty }))
  }

  // ── Builder ──────────────────────────────────────────────
  const openProductModal = (product: Product, mode: "cart" | "snack_box") => {
    setSelectedProduct(product)
    setLastProduct(product)
    setModalMode(mode)
    setModalQty(1)
    setSelectedVariantId(product.hasVariants && product.variants?.length ? product.variants[0].id : "")
  }

  const addToDraftBox = (product: Product, variantId?: string, qty = 1) => {
    const key = variantId ? `${product.id}__${variantId}` : product.id
    setDraftBox((prev) => ({ ...prev, [key]: (prev[key] || 0) + qty }))
    showToast(`${product.name} masuk ke box`)
    setSelectedProduct(null)
  }

  const removeFromDraftBox = (key: string) => {
    setDraftBox((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    const info = getCartItemInfo(key)
    if (info) showToast(`${info.name} dikeluarkan dari racikan`)
  }

  const updateDraftBoxQty = (key: string, qty: number) => {
    if (qty <= 0) removeFromDraftBox(key)
    else setDraftBox((prev) => ({ ...prev, [key]: qty }))
  }

  const draftBoxTotalPrice = boxUnitPrice(draftBox)
  const draftCount = Object.values(draftBox).reduce((a, b) => a + b, 0)

  const confirmSnackBox = () => {
    if (Object.keys(draftBox).length === 0) return showToast("Isi snack box belum dipilih!", "error")
    if (boxQty < 1) return showToast("Jumlah paket minimal 1 box!", "error")
    setSnackBoxes((prev) => [...prev, { items: draftBox, qty: boxQty, pkg: boxPkg }])
    setDraftBox({})
    setBoxQty(1)
    setBoxPkg("Box")
    setIsBuildingBox(false)
    setActiveCategory("Semua")
    showToast("Paket Snack Box tersimpan di keranjang")
  }

  // ── Totals ───────────────────────────────────────────────
  const normalCartTotalItems = Object.values(normalCart).reduce((a, b) => a + b, 0)
  const normalCartTotalPrice = Object.entries(normalCart).reduce((sum, [key, qty]) => sum + (getCartItemInfo(key)?.price || 0) * qty, 0)
  const grandTotalItems = normalCartTotalItems + snackBoxes.reduce((sum, box) => sum + box.qty, 0)
  const grandTotalPrice = normalCartTotalPrice + snackBoxes.reduce((sum, box) => sum + boxUnitPrice(box.items) * box.qty, 0)

  useEffect(() => emit(EVT.cartCount, grandTotalItems), [grandTotalItems])

  // ── WhatsApp checkout ────────────────────────────────────
  const handleCheckout = () => {
    if (grandTotalItems === 0) return showToast("Keranjang belanja Anda masih kosong!", "error")
    if (!customerInfo.name || !customerInfo.address || !customerInfo.date) return showToast("Mohon lengkapi data pengiriman!", "error")

    let text = `Halo Kauny Catering, saya ingin pesan:\n\n`
    if (Object.keys(normalCart).length > 0) {
      text += `*Pesanan Satuan:*\n`
      Object.entries(normalCart).forEach(([key, qty]) => {
        const info = getCartItemInfo(key)
        if (info) text += `- ${info.name} (${qty} x ${formatPrice(info.price)}) = ${formatPrice(info.price * qty)}\n`
      })
      text += `\n`
    }
    if (snackBoxes.length > 0) {
      text += `*Pesanan Paket (Snack Box):*\n`
      snackBoxes.forEach((box, index) => {
        const unit = boxUnitPrice(box.items)
        text += `\n📦 *Paket ${index + 1}* (${box.qty} Box) - Kemasan: ${box.pkg}\n`
        Object.entries(box.items).forEach(([key, qty]) => {
          const info = getCartItemInfo(key)
          if (info) text += `   - ${qty}x ${info.name}\n`
        })
        text += `   Subtotal Paket: ${box.qty} x ${formatPrice(unit)} = ${formatPrice(unit * box.qty)}\n`
      })
      text += `\n`
    }
    const tgl = new Date(customerInfo.date + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    text += `*Total Harga Keseluruhan: ${formatPrice(grandTotalPrice)}*\n\n`
    text += `*Data Pengiriman:*\nNama: ${customerInfo.name}\nAlamat: ${customerInfo.address}\nTanggal: ${tgl}\n`

    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`, "_blank")
  }

  const todayStr = useMemo(() => {
    const d = new Date()
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
    return d.toISOString().slice(0, 10)
  }, [])

  const mp = selectedProduct || lastProduct
  const modalUnitPrice = mp
    ? mp.hasVariants && mp.variantType === "DIFFERENT_PRICE"
      ? mp.variants?.find((v) => v.id === selectedVariantId)?.price || 0
      : mp.price
    : 0

  const categoryOptions = categories.map((c) => ({
    value: c,
    label: c === "Semua" ? "Semua Kategori" : c,
    hint: `${c === "Semua" ? initialProducts.length : initialProducts.filter((p) => p.categories?.some((x) => x.name === c)).length} menu`,
  }))

  const openCart = () => {
    setCheckoutStep("cart")
    setCartOpen(true)
  }

  /* ═════════════════════════ RENDER ═════════════════════════ */
  return (
    <>
      {/* Toast */}
      <div className={`toast-container ${toast.visible ? "visible" : ""}`} role="status" aria-live="polite">
        <div className="toast-content">
          <span className={`toast-icon ${toast.type}`}>{toast.type === "success" ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}</span>
          <span className="toast-text">{toast.message}</span>
        </div>
      </div>

      {/* ── Heading ───────────────────────────── */}
      <Reveal className="flex items-end justify-between gap-4 mb-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600 mb-1.5">{isBuildingBox ? "Mode racik paket" : "Katalog"}</div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-ink tracking-tight">{isBuildingBox ? "Racik Snack Box" : "Semua Menu"}</h2>
        </div>
        <div className="text-[12px] sm:text-[13px] text-ink-faded pb-0.5">
          <b className="text-ink">{visibleProducts.length}</b> menu
        </div>
      </Reveal>

      {/* ── Filter bar ───────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Dropdown
          value={activeCategory}
          options={categoryOptions}
          onChange={(v) => {
            setIsBuildingBox(false)
            setActiveCategory(v)
          }}
          variant="solid"
          className="flex-1 sm:flex-none min-w-0"
          fullWidth
          menuTitle="Kategori"
        />
        <div className="hidden sm:block">
          <Dropdown value={priceRange} options={PRICE_RANGES.map(({ value, label }) => ({ value, label }))} onChange={setPriceRange} label="Harga" variant="outline" menuTitle="Rentang harga" />
        </div>
        <button
          onClick={() => setIsBuildingBox((b) => !b)}
          className={`hidden sm:inline-flex items-center h-9 px-3.5 rounded-lg border text-[13px] font-semibold transition-all duration-300 ease-smooth
            ${isBuildingBox ? "bg-accent border-accent text-brand-950" : "bg-white border-hairline text-ink hover:border-brand-300"}`}
        >
          {isBuildingBox ? "Keluar mode racik" : "Racik Snack Box"}
        </button>
        {filtersActive && (
          <button onClick={resetFilters} className="hidden sm:inline-flex h-9 px-2 text-[13px] font-semibold text-ink-faded hover:text-cherry transition-colors animate-fade-up">
            Reset
          </button>
        )}
        <div className="sm:ml-auto">
          <Dropdown value={sortBy} options={SORTS} onChange={setSortBy} placeholder="Urutkan" variant="outline" align="right" menuTitle="Urutkan" />
        </div>
      </div>

      {/* HP: ajakan racik paket (ganti tombol di filter) */}
      {!isBuildingBox && (
        <button
          onClick={() => setIsBuildingBox(true)}
          className="sm:hidden w-full mb-4 flex items-center justify-between gap-3 rounded-lg bg-accent-soft px-4 py-3 text-left"
        >
          <span>
            <span className="block text-[13px] font-bold text-brand-900">Racik snack box sendiri</span>
            <span className="block text-[11.5px] text-ink-body mt-0.5">Pilih isi, kemasan, lalu jumlah box</span>
          </span>
          <ArrowRight size={16} className="text-brand-800 shrink-0" />
        </button>
      )}

      {/* Active search chip */}
      {query && (
        <div className="mb-4 flex items-center gap-2 text-[13px] animate-fade-up">
          <span className="text-ink-faded">Hasil untuk</span>
          <span className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-1 rounded-md bg-brand-50 text-brand-800 font-semibold">
            “{query}”
            <button onClick={() => { setQuery(""); emit(EVT.search, "") }} className="grid place-items-center h-5 w-5 rounded hover:bg-brand-100" aria-label="Hapus pencarian">
              <X size={12} strokeWidth={2.6} />
            </button>
          </span>
        </div>
      )}

      {/* ── Builder panel (tanpa modal: kemasan & jumlah langsung di sini) ── */}
      <div id="builder" className={`grid scroll-mt-32 transition-all duration-500 ease-smooth ${isBuildingBox ? "grid-rows-[1fr] opacity-100 mb-5" : "grid-rows-[0fr] opacity-0 mb-0"}`}>
        <div className="overflow-hidden">
          <div className="rounded-xl border border-brand-200 bg-brand-50/60 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-[15px] sm:text-lg font-bold text-ink">Isi 1 box</h3>
                <p className="text-[12px] sm:text-[13px] text-ink-faded mt-0.5">Tekan + pada menu di bawah untuk menambah isi.</p>
              </div>
              <button onClick={() => setIsBuildingBox(false)} className="shrink-0 text-[12px] font-semibold text-ink-faded hover:text-cherry">
                Batal
              </button>
            </div>

            {Object.keys(draftBox).length > 0 ? (
              <ul className="divide-y divide-brand-100 rounded-lg bg-white">
                {Object.entries(draftBox).map(([key, qty]) => {
                  const info = getCartItemInfo(key)
                  if (!info) return null
                  return (
                    <li key={key} className="flex items-center gap-3 p-2.5 animate-fade-up">
                      <Img src={info.product.imageUrl} className="h-10 w-10 rounded-md object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-ink truncate">{info.name}</div>
                        <div className="text-[11.5px] text-ink-faded">{formatPrice(info.price * qty)}</div>
                      </div>
                      <div className="w-[104px] shrink-0">
                        <QuantitySelector value={qty} size="sm" full onChange={(v) => updateDraftBoxQty(key, v)} onRemove={() => removeFromDraftBox(key)} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="rounded-lg border border-dashed border-brand-200 bg-white/70 px-4 py-5 text-center text-[13px] text-ink-faded">
                Box masih kosong.
              </div>
            )}

            <div className={`grid transition-all duration-500 ease-smooth ${draftCount > 0 ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_auto_auto] items-end gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="form-label">Kemasan</label>
                    <Dropdown value={boxPkg} options={PACKAGING} onChange={setBoxPkg} variant="field" fullWidth menuTitle="Jenis kemasan" />
                  </div>
                  <div>
                    <label className="form-label">Jumlah box</label>
                    <div className="w-[128px]">
                      <QuantitySelector value={boxQty} onChange={setBoxQty} full />
                    </div>
                  </div>
                  <button onClick={confirmSnackBox} className="btn h-10">
                    Simpan · {formatPrice(draftBoxTotalPrice * boxQty)}
                  </button>
                </div>
                <p className="form-help">{draftCount} item per box · {formatPrice(draftBoxTotalPrice)} / box</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product grid ───────────────────── */}
      {visibleProducts.length > 0 ? (
        <div key={gridKey} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4">
          {visibleProducts.map((p, i) => {
            const inCartQty = normalCart[p.id] || 0
            const sumFor = (obj: { [k: string]: number }) =>
              Object.entries(obj).reduce((n, [k, q]) => (k === p.id || k.startsWith(p.id + "__") ? n + q : n), 0)
            const badgeQty = isBuildingBox ? sumFor(draftBox) : sumFor(normalCart)
            const price = displayPrice(p)
            const fromPrice = p.hasVariants && p.variantType === "DIFFERENT_PRICE" && (p.variants?.length || 0) > 1
            const cat = p.categories?.[0]?.name
            const subline = p.hasVariants && p.variants?.length ? `${p.variants.length} varian` : p.categories?.map((c) => c.name).join(", ") || "Menu satuan"
            const showStepper = !isBuildingBox && inCartQty > 0 && !p.hasVariants

            const onAdd = () => {
              if (p.hasVariants) openProductModal(p, isBuildingBox ? "snack_box" : "cart")
              else if (isBuildingBox) addToDraftBox(p)
              else addToNormalCart(p)
            }

            return (
              <article
                key={p.id}
                className="card-in group relative flex flex-col rounded-xl bg-surface-1 p-2 sm:p-2.5 transition-all duration-500 ease-smooth hover:bg-white hover:shadow-lift sm:hover:-translate-y-1"
                style={{ ["--i" as string]: Math.min(i, 14) }}
              >
                <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-white">
                  <Img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.06]" />
                  {cat && <span className="badge absolute left-1.5 top-1.5 bg-tangerine text-white">{cat}</span>}
                  {badgeQty > 0 && (
                    <span className="absolute right-1.5 top-1.5 grid place-items-center h-5 min-w-[22px] px-1 rounded bg-accent text-brand-950 text-[10.5px] font-extrabold animate-fade-up">
                      {badgeQty}×
                    </span>
                  )}
                </div>

                <div className="flex flex-col flex-1 px-1 pt-2.5">
                  <h3 className="text-[12.5px] sm:text-[14px] font-semibold text-ink leading-snug line-clamp-2 min-h-[2.5em]">{p.name}</h3>
                  <div className="mt-0.5 text-[11px] sm:text-[12px] text-ink-faded truncate">{subline}</div>

                  <div className="mt-auto pt-2.5">
                    {showStepper ? (
                      <>
                        <div className="text-[14px] sm:text-base font-extrabold text-ink mb-1.5">{formatPrice(price)}</div>
                        <div className="animate-fade-up">
                          <QuantitySelector value={inCartQty} size="sm" tone="dark" full onChange={(q) => updateNormalCartQty(p.id, q)} onRemove={() => updateNormalCartQty(p.id, 0)} />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-end justify-between gap-2">
                        <div className="leading-tight min-w-0">
                          {fromPrice && <div className="text-[10px] text-ink-faded">Mulai</div>}
                          <div className="text-[14px] sm:text-base font-extrabold text-ink truncate">{formatPrice(price)}</div>
                        </div>
                        <button
                          type="button"
                          onClick={onAdd}
                          className={`add-fab ${isBuildingBox ? "bg-accent text-brand-950 hover:bg-accent-hover" : ""}`}
                          aria-label={isBuildingBox ? "Tambah ke box" : "Tambah ke keranjang"}
                        >
                          <Plus size={16} strokeWidth={2.6} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="text-center rounded-xl bg-surface-1 px-6 py-14 animate-fade-up">
          <h3 className="text-base font-bold text-ink">Menu tidak ditemukan</h3>
          <p className="text-[13px] text-ink-faded mt-1">
            {initialProducts.length === 0 ? "Belum ada menu yang ditambahkan." : "Coba ubah kata kunci, kategori, atau rentang harga."}
          </p>
          {filtersActive && (
            <button onClick={resetFilters} className="btn btn-outline mt-4">
              Reset filter
            </button>
          )}
        </div>
      )}

      {/* ── Modal varian (hanya untuk produk yang punya varian) ── */}
      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)} size="lg" bare>
        {mp && (
          <div className="sm:grid sm:grid-cols-[240px_1fr]">
            <div className="relative bg-surface-1 h-44 sm:h-auto">
              <Img src={mp.imageUrl} alt={mp.name} lazy={false} className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-lg sm:text-xl font-extrabold text-ink leading-snug pr-10">{mp.name}</h3>
              <div className="mt-1 text-lg font-extrabold text-brand-800">{formatPrice(modalUnitPrice)}</div>

              {mp.variants && mp.variants.length > 0 && (
                <div className="mt-5">
                  <div className="form-label">Pilih varian</div>
                  <div className="grid grid-cols-2 gap-2">
                    {mp.variants.map((v) => {
                      const on = v.id === selectedVariantId
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => setSelectedVariantId(v.id)}
                          className={`text-left rounded-lg border px-3 py-2.5 transition-all duration-200 ease-smooth
                          ${on ? "border-brand-700 bg-brand-50 ring-2 ring-brand-100" : "border-hairline hover:border-brand-300"}`}
                        >
                          <span className={`block text-[13px] font-semibold ${on ? "text-brand-800" : "text-ink"}`}>{v.name}</span>
                          {mp.variantType === "DIFFERENT_PRICE" && <span className="block text-[11.5px] text-ink-faded mt-0.5">{formatPrice(v.price)}</span>}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <div className="w-[120px] shrink-0">
                  <QuantitySelector value={modalQty} onChange={setModalQty} full />
                </div>
                <button
                  className={`btn flex-1 justify-between px-4 ${modalMode === "snack_box" ? "btn-accent" : ""}`}
                  onClick={() => {
                    if (!selectedProduct) return
                    const vId = selectedProduct.hasVariants ? selectedVariantId : undefined
                    if (modalMode === "snack_box") addToDraftBox(selectedProduct, vId, modalQty)
                    else addToNormalCart(selectedProduct, vId, modalQty)
                  }}
                >
                  <span>{modalMode === "snack_box" ? "Masukkan box" : "Tambah"}</span>
                  <span className="font-extrabold">{formatPrice(modalUnitPrice * modalQty)}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Floating bar (HP & desktop) ─────── */}
      {(() => {
        const building = isBuildingBox && draftCount > 0
        const show = !cartOpen && (building || grandTotalItems > 0)
        return (
          <div
            className={`fixed inset-x-0 bottom-0 z-[90] px-3 pb-3 sm:pb-5 pointer-events-none transition-all duration-500 ease-smooth
            ${show ? "translate-y-0 opacity-100" : "translate-y-[140%] opacity-0"}`}
          >
            <button
              onClick={() => (building ? scrollToId("builder", 130) : openCart())}
              className="pointer-events-auto mx-auto flex w-full max-w-lg items-center gap-3 rounded-xl bg-brand-950/95 backdrop-blur-xl p-1.5 pl-4 text-white shadow-pop hover:bg-brand-950 transition-colors group"
            >
              <span className="flex-1 text-left leading-tight">
                <span className="block text-[11px] text-white/60">{building ? `Isi box · ${draftCount} item` : `${grandTotalItems} item di keranjang`}</span>
                <span className="block text-[14px] font-extrabold">{building ? `${formatPrice(draftBoxTotalPrice)} / box` : formatPrice(grandTotalPrice)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-accent text-brand-950 text-[13px] font-bold">
                {building ? "Atur kemasan" : "Checkout"}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </div>
        )
      })()}

      {/* ── Cart drawer ─────────────────────── */}
      <Drawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title={
          checkoutStep === "cart" ? (
            <span>Keranjang <span className="text-ink-faded font-semibold">({grandTotalItems})</span></span>
          ) : (
            <button onClick={() => setCheckoutStep("cart")} className="hover:text-brand-700 transition-colors">
              ← Data Pengiriman
            </button>
          )
        }
        footer={
          grandTotalItems > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-ink-faded">Total</span>
                <span className="text-lg font-extrabold text-brand-800">{formatPrice(grandTotalPrice)}</span>
              </div>
              {checkoutStep === "cart" ? (
                <button className="btn w-full h-11" onClick={() => setCheckoutStep("form")}>
                  Lanjut ke Pengiriman
                </button>
              ) : (
                <button className="btn btn-wa w-full h-11" onClick={handleCheckout}>
                  Kirim Pesanan via WhatsApp
                </button>
              )}
            </div>
          ) : undefined
        }
      >
        {grandTotalItems === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full px-8 py-16">
            <h3 className="text-base font-bold text-ink">Keranjang masih kosong</h3>
            <p className="text-[13px] text-ink-faded mt-1">Pilih menu favorit atau racik snack box Anda.</p>
            <button
              className="btn mt-5"
              onClick={() => {
                setCartOpen(false)
                setTimeout(() => scrollToId("menu", 130), 350)
              }}
            >
              Lihat Menu
            </button>
          </div>
        ) : checkoutStep === "cart" ? (
          <div key="cart" className="p-4 sm:p-5 space-y-5 animate-fade-up">
            {Object.keys(normalCart).length > 0 && (
              <section>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faded mb-2">Produk satuan</div>
                <ul className="divide-y divide-hairline">
                  {Object.entries(normalCart).map(([key, qty]) => {
                    const info = getCartItemInfo(key)
                    if (!info) return null
                    return (
                      <li key={key} className="flex items-center gap-3 py-2.5">
                        <Img src={info.product.imageUrl} lazy={false} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-ink line-clamp-1">{info.product.name}</div>
                          {info.variant && <div className="text-[11.5px] text-ink-faded">{info.variant.name}</div>}
                          <div className="text-[13px] font-bold text-brand-800">{formatPrice(info.price * qty)}</div>
                        </div>
                        <div className="w-[104px] shrink-0">
                          <QuantitySelector value={qty} size="sm" full onChange={(q) => updateNormalCartQty(key, q)} onRemove={() => updateNormalCartQty(key, 0)} />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            {snackBoxes.length > 0 && (
              <section>
                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faded mb-2">Paket snack box</div>
                <ul className="space-y-2">
                  {snackBoxes.map((box, index) => {
                    const unit = boxUnitPrice(box.items)
                    const open = expandedBox === index
                    return (
                      <li key={index} className="rounded-lg border border-hairline overflow-hidden">
                        <div className="flex items-center justify-between gap-3 px-3 pt-3">
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-ink">Paket {index + 1}</div>
                            <div className="text-[11.5px] text-ink-faded">{box.pkg} · {formatPrice(unit)}/box</div>
                          </div>
                          <button
                            className="text-[12px] font-semibold text-ink-faded hover:text-red-600 transition-colors"
                            onClick={() => setSnackBoxes((prev) => prev.filter((_, i) => i !== index))}
                          >
                            Hapus
                          </button>
                        </div>
                        <button
                          onClick={() => setExpandedBox(open ? null : index)}
                          className="mx-3 mt-1.5 flex items-center gap-1 text-[12px] font-semibold text-brand-700"
                        >
                          {open ? "Sembunyikan isi" : `Lihat isi (${Object.keys(box.items).length})`}
                          <ChevronDown size={13} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
                        </button>
                        <div className={`grid transition-all duration-500 ease-smooth ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                          <div className="overflow-hidden">
                            <ul className="px-3 pt-2 space-y-0.5 text-[12.5px] text-ink-body">
                              {Object.entries(box.items).map(([key, qty]) => {
                                const info = getCartItemInfo(key)
                                return info ? <li key={key}>{qty}× {info.name}</li> : null
                              })}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 p-3">
                          <span className="text-[13px] font-bold text-brand-800">{formatPrice(unit * box.qty)}</span>
                          <div className="w-[104px]">
                            <QuantitySelector
                              value={box.qty}
                              size="sm"
                              full
                              onChange={(val) => setSnackBoxes((prev) => prev.map((b, i) => (i === index ? { ...b, qty: val } : b)))}
                            />
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}

            <button
              onClick={() => {
                setCartOpen(false)
                setIsBuildingBox(true)
                setTimeout(() => scrollToId("menu", 130), 350)
              }}
              className="w-full h-10 rounded-lg border border-dashed border-brand-300 text-[13px] font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
            >
              + Racik paket snack box baru
            </button>
          </div>
        ) : (
          <div key="form" className="p-4 sm:p-5 animate-fade-up">
            <p className="text-[13px] text-ink-faded mb-5">Isi data berikut, lalu pesanan dikirim ke admin lewat WhatsApp.</p>
            <div className="form-group">
              <label className="form-label">Nama pemesan</label>
              <input className="form-input" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} placeholder="Nama lengkap Anda" />
            </div>
            <div className="form-group">
              <label className="form-label">Alamat pengiriman</label>
              <textarea
                className="form-input"
                rows={3}
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                placeholder="RT/RW, Kelurahan, Kecamatan, Kota"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tanggal pengiriman</label>
              <input type="date" min={todayStr} className="form-input" value={customerInfo.date} onChange={(e) => setCustomerInfo({ ...customerInfo, date: e.target.value })} />
            </div>
          </div>
        )}
      </Drawer>
    </>
  )
}
