"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingBasket, X } from "lucide-react"
import { EVT, emit, scrollToId, useEvent } from "./ui"

export default function Header({
  storeName,
  logoUrl,
  announcement,
}: {
  storeName: string
  logoUrl: string
  announcement: string
}) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState("")
  const [cartCount, setCartCount] = useState(0)
  const [bump, setBump] = useState(false)

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
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  if (pathname?.startsWith("/admin")) return null

  const onSearch = (v: string) => {
    setQuery(v)
    emit(EVT.search, v)
  }

  return (
    <>
      {announcement && (
        <div className="bg-brand-900 text-white/85 text-[11.5px] sm:text-xs font-medium">
          <div className="container-x py-1.5 text-center truncate">{announcement}</div>
        </div>
      )}

      <header className={`top-header sticky top-0 z-[100] bg-white/95 backdrop-blur-xl ${scrolled ? "scrolled" : ""}`}>
        <div className="container-x">
          <div className="h-14 sm:h-16 flex items-center gap-3 sm:gap-8">
            <Link href="/" className="flex items-center gap-2 min-w-0" aria-label={storeName}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt={storeName} className="h-8 sm:h-9 w-auto max-w-[150px] object-contain" />
              ) : (
                <>
                  <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-brand-800 text-accent text-sm font-extrabold">{storeName.charAt(0)}</span>
                  <span className="text-[15px] sm:text-base font-bold tracking-tight text-brand-900 truncate">{storeName}</span>
                </>
              )}
            </Link>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                emit(EVT.search, query)
                scrollToId("menu", 120)
              }}
              className="relative hidden md:block flex-1 max-w-xl"
              role="search"
            >
              <SearchInput query={query} onSearch={onSearch} />
            </form>

            <button
              onClick={() => emit(EVT.openCart)}
              className={`ml-auto md:ml-0 relative inline-flex items-center gap-2 h-10 pl-3 pr-3.5 rounded-lg bg-brand-800 text-white text-[13px] font-semibold hover:bg-brand-900 transition-colors ${bump ? "animate-cart-blink" : ""}`}
              aria-label="Buka keranjang"
            >
              <ShoppingBasket size={17} />
              Keranjang
              <span
                className={`grid place-items-center min-w-[20px] h-5 px-1 rounded-md bg-accent text-brand-950 text-[11px] font-extrabold transition-all duration-300 ease-spring ${cartCount > 0 ? "scale-100 opacity-100 ml-0" : "scale-0 opacity-0 -ml-5"}`}
              >
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              emit(EVT.search, query)
              scrollToId("menu", 120)
              ;(document.activeElement as HTMLElement | null)?.blur()
            }}
            className="relative md:hidden pb-2.5"
            role="search"
          >
            <SearchInput query={query} onSearch={onSearch} />
          </form>
        </div>
      </header>
    </>
  )
}

function SearchInput({ query, onSearch }: { query: string; onSearch: (v: string) => void }) {
  return (
    <>
      <Search size={16} className="absolute left-3.5 top-5 md:top-1/2 -translate-y-1/2 text-ink-faded pointer-events-none" />
      <input
        value={query}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Cari menu… (misal: risoles, nasi box)"
        enterKeyHint="search"
        className="w-full h-10 rounded-lg bg-surface-1 border border-transparent pl-10 pr-9 text-[13.5px] text-ink placeholder:text-ink-faded
          outline-none transition-all duration-300 ease-smooth focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-100"
        aria-label="Cari menu"
      />
      {query && (
        <button type="button" onClick={() => onSearch("")} className="absolute right-2.5 top-5 md:top-1/2 -translate-y-1/2 grid place-items-center h-6 w-6 rounded text-ink-faded hover:text-ink" aria-label="Hapus pencarian">
          <X size={15} strokeWidth={2.4} />
        </button>
      )}
    </>
  )
}
