"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Search, ShoppingBasket, X } from "lucide-react"
import { EVT, emit, scrollToId, useEvent, usePresence } from "./ui"

const NAV = [
  { label: "Beranda", id: "top" },
  { label: "Layanan", id: "promo" },
  { label: "Paket Snack", id: "menu", builder: true },
  { label: "Info Toko", id: "store" },
]

export default function Header({
  storeName,
  logoUrl,
  waNumber,
  categories,
}: {
  storeName: string
  logoUrl: string
  waNumber: string
  categories: string[]
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [bump, setBump] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuPresence = usePresence(menuOpen, 200)

  useEvent<number>(EVT.cartCount, (n) => {
    setCartCount((prev) => {
      if (n > prev) {
        setBump(true)
        setTimeout(() => setBump(false), 520)
      }
      return n
    })
  })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false)
    document.addEventListener("pointerdown", onDown)
    window.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      window.removeEventListener("keydown", onKey)
    }
  }, [menuOpen])

  if (pathname?.startsWith("/admin")) return null

  const go = (id: string) => {
    setMenuOpen(false)
    setTimeout(() => (id === "top" ? window.scrollTo({ top: 0, behavior: "smooth" }) : scrollToId(id, 130)), 40)
  }

  const pickCategory = (cat: string) => {
    emit(EVT.category, cat)
    go("menu")
  }

  const onSearch = (v: string) => {
    setQuery(v)
    emit(EVT.search, v)
  }

  const searchBox = (className = "") => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        emit(EVT.search, query)
        go("menu")
      }}
      className={`relative ${className}`}
      role="search"
    >
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faded pointer-events-none" />
      <input
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Cari menu atau kategori…"
        enterKeyHint="search"
        className="w-full h-10 rounded-lg bg-surface-1 border border-transparent pl-10 pr-9 text-[13px] text-ink placeholder:text-ink-faded
          outline-none transition-all duration-300 ease-smooth focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
        aria-label="Cari menu"
      />
      {query && (
        <button type="button" onClick={() => onSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center h-5 w-5 rounded text-ink-faded hover:text-ink" aria-label="Hapus pencarian">
          <X size={14} strokeWidth={2.4} />
        </button>
      )}
    </form>
  )

  return (
    <>
      {/* Announcement bar */}
      <div className="hidden sm:block bg-brand-900 text-white/80 text-[11.5px] font-medium">
        <div className="container-x h-8 flex items-center justify-center gap-8">
          <span>
            Konsultasi menu <b className="text-accent font-semibold">gratis</b> untuk acara Anda
          </span>
          <span className="hidden md:inline text-white/30">•</span>
          <span className="hidden md:inline">
            Pesan mudah lewat <b className="text-accent font-semibold">WhatsApp</b>
          </span>
          <span className="hidden lg:inline text-white/30">•</span>
          <span className="hidden lg:inline">Bahan segar &amp; 100% halal</span>
        </div>
      </div>

      <header className={`top-header sticky top-0 z-[100] bg-white/95 backdrop-blur-xl ${scrolled ? "scrolled" : ""}`}>
        <div className="container-x">
          <div className="h-14 sm:h-16 flex items-center gap-4 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0" aria-label={storeName}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={storeName} className="h-8 sm:h-9 w-auto max-w-[150px] object-contain" />
              ) : (
                <>
                  <span className="grid place-items-center h-8 w-8 rounded-lg bg-brand-800 text-accent text-sm font-extrabold">
                    {storeName.charAt(0)}
                  </span>
                  <span className="text-[15px] sm:text-base font-bold tracking-tight text-brand-900">{storeName}</span>
                </>
              )}
            </Link>

            {searchBox("hidden md:block flex-1 max-w-xl")}

            <div className="flex items-center gap-2 ml-auto">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center h-9 px-3 rounded-lg text-[13px] font-semibold text-brand-800 hover:bg-brand-50 transition-colors"
              >
                Hubungi kami
              </a>
              <button
                onClick={() => emit(EVT.openCart)}
                className={`relative grid place-items-center h-9 w-9 rounded-lg bg-brand-800 text-white hover:bg-brand-900 transition-colors ${bump ? "animate-cart-blink" : ""}`}
                aria-label="Buka keranjang"
              >
                <ShoppingBasket size={17} strokeWidth={2} />
                <span
                  className={`absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-md bg-accent text-brand-950 text-[10px] font-extrabold grid place-items-center ring-2 ring-white transition-all duration-300 ease-spring ${cartCount > 0 ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              </button>
            </div>
          </div>

          {/* Search HP */}
          <div className="md:hidden pb-2.5">{searchBox()}</div>
        </div>

        {/* Nav — HP: baris geser, desktop: menu + dropdown kategori */}
        <div className="border-t border-hairline/80">
          <div className="container-x h-10 sm:h-11 flex items-center justify-between gap-4">
            <nav className="flex items-center gap-1 -mx-1 overflow-x-auto no-scrollbar lg:overflow-visible" aria-label="Navigasi utama">
              <div ref={menuRef} className="relative hidden lg:block">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-expanded={menuOpen}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-md text-[13px] font-semibold transition-colors ${menuOpen ? "bg-brand-800 text-white" : "text-ink hover:bg-surface-1"}`}
                >
                  Kategori Menu
                  <ChevronDown size={14} strokeWidth={2.4} className={`transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`} />
                </button>

                {menuPresence.mounted && (
                  <div
                    className={`absolute left-0 top-full mt-2 w-60 rounded-xl bg-white border border-hairline shadow-pop p-1.5 origin-top-left transition-all duration-200 ease-smooth
                    ${menuPresence.visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-1 scale-[0.97] pointer-events-none"}`}
                  >
                    {["Semua", ...categories].map((c, i) => (
                      <button
                        key={c}
                        onClick={() => pickCategory(c)}
                        style={{ transitionDelay: menuPresence.visible ? `${i * 18}ms` : "0ms" }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[13px] hover:bg-brand-50 hover:text-brand-800 transition-all duration-200
                        ${c === "Semua" ? "font-semibold text-ink" : "text-ink-body"} ${menuPresence.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}
                      >
                        {c === "Semua" ? "Semua Menu" : c}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {NAV.map((n) => (
                <button
                  key={n.label}
                  onClick={() => (n.builder ? (emit(EVT.category, "__builder__"), go("menu")) : go(n.id))}
                  className="shrink-0 h-8 px-2.5 sm:px-3 rounded-md text-[12.5px] sm:text-[13px] font-medium text-ink-body hover:text-brand-800 hover:bg-surface-1 transition-colors"
                >
                  {n.label}
                </button>
              ))}
            </nav>

            <button onClick={() => go("store")} className="hidden lg:block text-[13px] font-medium text-ink-body hover:text-brand-800 transition-colors">
              Jam &amp; Lokasi
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
